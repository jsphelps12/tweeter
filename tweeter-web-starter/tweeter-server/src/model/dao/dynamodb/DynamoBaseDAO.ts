import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


export abstract class DynamoBaseDAO {
    protected readonly client: DynamoDBDocumentClient;

    constructor() {
        const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
        this.client = DynamoDBDocumentClient.from(dynamoClient);
    }

    protected async queryPaginatedByPartitionKey<T>(
        tableName: string,
        partitionKeyName: string,
        partitionKeyValue: string,
        sortKeyName: string,
        pageSize: number,
        lastSortKeyValue: number | null,
        mapItem: (item: any) => T
    ): Promise<{ items: T[]; hasMore: boolean }> {
        const params: any = {
            TableName: tableName,
            KeyConditionExpression: `${partitionKeyName} = :pkValue`,
            ExpressionAttributeValues: {
                ":pkValue": partitionKeyValue,
            },
            Limit: pageSize,
            ScanIndexForward: false,
        };

        if (lastSortKeyValue) {
            params.ExclusiveStartKey = {
                [partitionKeyName]: partitionKeyValue,
                [sortKeyName]: lastSortKeyValue,
            };
        }

        const result = await this.client.send(new QueryCommand(params));

        const items = result.Items?.map(mapItem) || [];
        const hasMore = !!result.LastEvaluatedKey;

        return { items, hasMore };
    }
}
