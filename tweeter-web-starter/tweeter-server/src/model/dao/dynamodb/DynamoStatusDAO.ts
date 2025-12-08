import { StatusDAO } from "../interface/StatusDAO";
import {
    PutCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoBaseDAO } from "./DynamoBaseDAO";

export class DynamoStatusDAO extends DynamoBaseDAO implements StatusDAO {
    private readonly tableName = "tweeter-statuses";

    constructor() {
        super();
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
        const { items, hasMore } = await this.queryPaginatedByPartitionKey(
            this.tableName,
            "author_alias",
            authorAlias,
            "timestamp",
            pageSize,
            lastStatusTimestamp,
            (item) => ({
                post: item.post,
                authorAlias: item.author_alias,
                timestamp: item.timestamp,
            })
        );

        return { statuses: items, hasMore };
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
