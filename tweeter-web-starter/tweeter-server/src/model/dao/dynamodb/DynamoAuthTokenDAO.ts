import { AuthTokenDAO } from "../interface/AuthTokenDAO";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoAuthTokenDAO implements AuthTokenDAO {
    private readonly tableName = "tweeter-auth-tokens";
    private readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    async putAuthToken(token: string, alias: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                token: token,
                alias: alias,
                timestamp: timestamp,
            },
        };

        await this.client.send(new PutCommand(params));
    }

    async getAuthToken(token: string): Promise<{ token: string; alias: string; timestamp: number } | null> {
        const params = {
            TableName: this.tableName,
            Key: {
                token: token,
            },
        };

        const result = await this.client.send(new GetCommand(params));
        
        if (!result.Item) {
            return null;
        }

        return {
            token: result.Item.token,
            alias: result.Item.alias,
            timestamp: result.Item.timestamp,
        };
    }

    async updateAuthToken(token: string, timestamp: number): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                token: token,
            },
            UpdateExpression: "SET #timestamp = :timestamp",
            ExpressionAttributeNames: {
                "#timestamp": "timestamp",
            },
            ExpressionAttributeValues: {
                ":timestamp": timestamp,
            },
        };

        await this.client.send(new UpdateCommand(params));
    }

    async deleteAuthToken(token: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                token: token,
            },
        };

        await this.client.send(new DeleteCommand(params));
    }
}
