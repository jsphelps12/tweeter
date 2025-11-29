import { FeedDAO } from "../interface/FeedDAO";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand,
    BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoFeedDAO implements FeedDAO {
    private readonly tableName = "tweeter-feeds";
    private readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    async putFeedItem(recipientAlias: string, post: string, authorAlias: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                recipient_alias: recipientAlias,
                timestamp: timestamp,
                author_alias: authorAlias,
                post: post,
            },
        };

        await this.client.send(new PutCommand(params));
    }

    async batchPutFeedItems(
        recipientAliases: string[],
        post: string,
        authorAlias: string,
        timestamp: number
    ): Promise<void> {
        // DynamoDB BatchWrite can handle max 25 items at a time
        const batchSize = 25;

        for (let i = 0; i < recipientAliases.length; i += batchSize) {
            const batch = recipientAliases.slice(i, i + batchSize);

            const putRequests = batch.map((recipientAlias) => ({
                PutRequest: {
                    Item: {
                        recipient_alias: recipientAlias,
                        timestamp: timestamp,
                        author_alias: authorAlias,
                        post: post,
                    },
                },
            }));

            const params = {
                RequestItems: {
                    [this.tableName]: putRequests,
                },
            };

            await this.client.send(new BatchWriteCommand(params));
        }
    }

    async getPageOfFeedItems(
        recipientAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }> {
        const params: any = {
            TableName: this.tableName,
            KeyConditionExpression: "recipient_alias = :recipient",
            ExpressionAttributeValues: {
                ":recipient": recipientAlias,
            },
            Limit: pageSize,
            ScanIndexForward: false, // Sort descending (newest first)
        };

        if (lastStatusTimestamp) {
            params.ExclusiveStartKey = {
                recipient_alias: recipientAlias,
                timestamp: lastStatusTimestamp,
            };
        }

        const result = await this.client.send(new QueryCommand(params));

        const statuses =
            result.Items?.map((item) => ({
                post: item.post,
                authorAlias: item.author_alias,
                timestamp: item.timestamp,
            })) || [];

        const hasMore = !!result.LastEvaluatedKey;

        return { statuses, hasMore };
    }

    async deleteStatusFromFeed(recipientAlias: string, authorAlias: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                recipient_alias: recipientAlias,
                timestamp: timestamp,
            },
        };

        await this.client.send(new DeleteCommand(params));
    }
}
