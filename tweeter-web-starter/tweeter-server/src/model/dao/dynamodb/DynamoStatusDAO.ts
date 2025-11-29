import { StatusDAO } from "../interface/StatusDAO";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoStatusDAO implements StatusDAO {
    private readonly tableName = "tweeter-statuses";
    private readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    async putStatus(post: string, authorAlias: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                author_alias: authorAlias,
                timestamp: timestamp,
                post: post,
            },
        };

        await this.client.send(new PutCommand(params));
    }

    async getPageOfStatuses(
        authorAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }> {
        const params: any = {
            TableName: this.tableName,
            KeyConditionExpression: "author_alias = :author",
            ExpressionAttributeValues: {
                ":author": authorAlias,
            },
            Limit: pageSize,
            ScanIndexForward: false, // Sort descending (newest first)
        };

        if (lastStatusTimestamp) {
            params.ExclusiveStartKey = {
                author_alias: authorAlias,
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

    async deleteStatus(authorAlias: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                author_alias: authorAlias,
                timestamp: timestamp,
            },
        };

        await this.client.send(new DeleteCommand(params));
    }
}
