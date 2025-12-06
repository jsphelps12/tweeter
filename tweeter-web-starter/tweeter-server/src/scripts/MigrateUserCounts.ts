import { DynamoDBClient, ScanCommand, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * One-time migration script to add followerCount and followeeCount to existing users
 * Run this once to fix users created before the putUser() fix
 * Calculates actual counts by querying the follow table
 */

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
const USERS_TABLE = "tweeter-users";
const FOLLOWS_TABLE = "tweeter-follows";
const FOLLOWS_INDEX = "followee_follower_index"; // GSI with followee_alias as partition key

async function getFollowerCount(alias: string): Promise<number> {
  // Query the GSI where this user is the followee
  let count = 0;
  let lastEvaluatedKey: any = undefined;

  do {
    const queryCommand = new QueryCommand({
      TableName: FOLLOWS_TABLE,
      IndexName: FOLLOWS_INDEX,
      KeyConditionExpression: "followee_alias = :alias",
      ExpressionAttributeValues: {
        ":alias": { S: alias },
      },
      Select: "COUNT",
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await client.send(queryCommand);
    count += result.Count || 0;
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return count;
}

async function getFolloweeCount(alias: string): Promise<number> {
  // Query the main table where this user is the follower
  let count = 0;
  let lastEvaluatedKey: any = undefined;

  do {
    const queryCommand = new QueryCommand({
      TableName: FOLLOWS_TABLE,
      KeyConditionExpression: "follower_alias = :alias",
      ExpressionAttributeValues: {
        ":alias": { S: alias },
      },
      Select: "COUNT",
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await client.send(queryCommand);
    count += result.Count || 0;
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return count;
}

async function migrateUserCounts() {
  console.log("Scanning for users without count attributes...");
  
  let scannedCount = 0;
  let updatedCount = 0;
  let lastEvaluatedKey: any = undefined;

  do {
    // Scan the users table
    const scanCommand = new ScanCommand({
      TableName: USERS_TABLE,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const scanResult = await client.send(scanCommand);
    
    if (scanResult.Items) {
      scannedCount += scanResult.Items.length;
      
      // Process each user
      for (const item of scanResult.Items) {
        const alias = item.alias?.S;
        const currentFollowerCount = item.followerCount?.N ? parseInt(item.followerCount.N) : undefined;
        const currentFolloweeCount = item.followeeCount?.N ? parseInt(item.followeeCount.N) : undefined;
        
        // Update if either count is missing OR if either count is 0 (might be wrong)
        const needsUpdate = 
          currentFollowerCount === undefined || 
          currentFolloweeCount === undefined ||
          currentFollowerCount === 0 ||
          currentFolloweeCount === 0;
        
        if (needsUpdate) {
          console.log(`\nCalculating counts for ${alias}...`);
          
          try {
            // Calculate actual counts from follow table
            const [followerCount, followeeCount] = await Promise.all([
              getFollowerCount(alias!),
              getFolloweeCount(alias!)
            ]);
            
            console.log(`  Followers: ${followerCount}, Following: ${followeeCount}`);
            
            const updateCommand = new UpdateItemCommand({
              TableName: USERS_TABLE,
              Key: {
                alias: { S: alias! },
              },
              UpdateExpression: "SET followerCount = :followerCount, followeeCount = :followeeCount",
              ExpressionAttributeValues: {
                ":followerCount": { N: followerCount.toString() },
                ":followeeCount": { N: followeeCount.toString() },
              },
            });
            
            await client.send(updateCommand);
            updatedCount++;
          } catch (error) {
            console.error(`Failed to update ${alias}:`, error);
          }
        }
      }
    }
    
    lastEvaluatedKey = scanResult.LastEvaluatedKey;
    console.log(`\nScanned ${scannedCount} users, updated ${updatedCount} so far...`);
    
  } while (lastEvaluatedKey);

  console.log(`\n=== Migration complete! ===`);
  console.log(`Total users scanned: ${scannedCount}`);
  console.log(`Total users updated: ${updatedCount}`);
}

migrateUserCounts().catch(console.error);
