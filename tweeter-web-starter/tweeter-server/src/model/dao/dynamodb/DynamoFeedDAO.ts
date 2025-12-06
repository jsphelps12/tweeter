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
        const batchSize = 25;

        for (let i = 0; i < recipientAliases.length; i += batchSize) {
            const batch = recipientAliases.slice(i, i + batchSize);
            let unprocessedAliases = batch;
            let attempts = 0;
            const maxAttempts = 3;

            while (unprocessedAliases.length > 0 && attempts < maxAttempts) {
                const putRequests = unprocessedAliases.map((recipientAlias) => ({
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

                const result = await this.client.send(new BatchWriteCommand(params));

                // Extract unprocessed items to retry
                const unprocessedItems = result.UnprocessedItems?.[this.tableName] || [];
                unprocessedAliases = unprocessedItems
                    .map((req) => req.PutRequest?.Item?.recipient_alias)
                    .filter((alias): alias is string => !!alias);

                attempts++;

                if (unprocessedAliases.length > 0 && attempts < maxAttempts) {
                    // Exponential backoff: 100ms, 200ms, 400ms
                    await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempts - 1)));
                }
            }

            if (unprocessedAliases.length > 0) {
                throw new Error(
                    `Failed to write ${unprocessedAliases.length} feed items after ${maxAttempts} attempts`
                );
            }
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
            ScanIndexForward: false, 
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
