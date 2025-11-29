import { FollowDAO } from "../interface/FollowDAO";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoFollowDAO implements FollowDAO {
    private readonly tableName = "tweeter-follows";
    private readonly indexName = "followee_follower_index";
    private readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    async putFollow(followerAlias: string, followeeAlias: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                follower_alias: followerAlias,
                followee_alias: followeeAlias,
            },
        };

        await this.client.send(new PutCommand(params));
    }

    async deleteFollow(followerAlias: string, followeeAlias: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                follower_alias: followerAlias,
                followee_alias: followeeAlias,
            },
        };

        await this.client.send(new DeleteCommand(params));
    }

    async getFollow(
        followerAlias: string,
        followeeAlias: string
    ): Promise<{ followerAlias: string; followeeAlias: string } | null> {
        const params = {
            TableName: this.tableName,
            Key: {
                follower_alias: followerAlias,
                followee_alias: followeeAlias,
            },
        };

        const result = await this.client.send(new GetCommand(params));

        if (!result.Item) {
            return null;
        }

        return {
            followerAlias: result.Item.follower_alias,
            followeeAlias: result.Item.followee_alias,
        };
    }

    async getPageOfFollowees(
        followerAlias: string,
        pageSize: number,
        lastFolloweeAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }> {
        const params: any = {
            TableName: this.tableName,
            KeyConditionExpression: "follower_alias = :follower",
            ExpressionAttributeValues: {
                ":follower": followerAlias,
            },
            Limit: pageSize,
        };

        if (lastFolloweeAlias) {
            params.ExclusiveStartKey = {
                follower_alias: followerAlias,
                followee_alias: lastFolloweeAlias,
            };
        }

        const result = await this.client.send(new QueryCommand(params));

        const aliases = result.Items?.map((item) => item.followee_alias) || [];
        const hasMore = !!result.LastEvaluatedKey;

        return { aliases, hasMore };
    }

    async getPageOfFollowers(
        followeeAlias: string,
        pageSize: number,
        lastFollowerAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }> {
        const params: any = {
            TableName: this.tableName,
            IndexName: this.indexName,
            KeyConditionExpression: "followee_alias = :followee",
            ExpressionAttributeValues: {
                ":followee": followeeAlias,
            },
            Limit: pageSize,
        };

        if (lastFollowerAlias) {
            params.ExclusiveStartKey = {
                followee_alias: followeeAlias,
                follower_alias: lastFollowerAlias,
            };
        }

        const result = await this.client.send(new QueryCommand(params));

        const aliases = result.Items?.map((item) => item.follower_alias) || [];
        const hasMore = !!result.LastEvaluatedKey;

        return { aliases, hasMore };
    }
}
