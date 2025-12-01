import { UserDAO } from "../interface/UserDAO";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoUserDAO implements UserDAO {
    private readonly tableName = "tweeter-users";
    private readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    async putUser(
        firstName: string,
        lastName: string,
        alias: string,
        hashedPassword: string,
        imageUrl: string
    ): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                alias: alias,
                firstName: firstName,
                lastName: lastName,
                hashedPassword: hashedPassword,
                imageUrl: imageUrl,
            },
        };

        await this.client.send(new PutCommand(params));
    }

    async getUser(alias: string): Promise<{ firstName: string; lastName: string; alias: string; imageUrl: string } | null> {
        const params = {
            TableName: this.tableName,
            Key: {
                alias: alias,
            },
        };

        const result = await this.client.send(new GetCommand(params));

        if (!result.Item) {
            return null;
        }

        return {
            firstName: result.Item.firstName,
            lastName: result.Item.lastName,
            alias: result.Item.alias,
            imageUrl: result.Item.imageUrl,
        };
    }

    async getPasswordHash(alias: string): Promise<string | null> {
        const params = {
            TableName: this.tableName,
            Key: {
                alias: alias,
            },
            ProjectionExpression: "hashedPassword",
        };

        const result = await this.client.send(new GetCommand(params));

        if (!result.Item) {
            return null;
        }

        return result.Item.hashedPassword;
    }

    async updateUser(
        alias: string,
        firstName?: string,
        lastName?: string,
        imageUrl?: string
    ): Promise<void> {
        const updateExpressions: string[] = [];
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};

        if (firstName) {
            updateExpressions.push("#firstName = :firstName");
            expressionAttributeNames["#firstName"] = "firstName";
            expressionAttributeValues[":firstName"] = firstName;
        }

        if (lastName) {
            updateExpressions.push("#lastName = :lastName");
            expressionAttributeNames["#lastName"] = "lastName";
            expressionAttributeValues[":lastName"] = lastName;
        }

        if (imageUrl) {
            updateExpressions.push("#imageUrl = :imageUrl");
            expressionAttributeNames["#imageUrl"] = "imageUrl";
            expressionAttributeValues[":imageUrl"] = imageUrl;
        }

        if (updateExpressions.length === 0) {
            return;
        }

        const params = {
            TableName: this.tableName,
            Key: {
                alias: alias,
            },
            UpdateExpression: `SET ${updateExpressions.join(", ")}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        };

        await this.client.send(new UpdateCommand(params));
    }

    async deleteUser(alias: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                alias: alias,
            },
        };

        await this.client.send(new DeleteCommand(params));
    }
}
