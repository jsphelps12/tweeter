export interface FeedDAO {

    putFeedItem(recipientAlias: string, post: string, authorAlias: string, timestamp: number): Promise<void>;

    batchPutFeedItems(recipientAliases: string[], post: string, authorAlias: string, timestamp: number): Promise<void>;

    getPageOfFeedItems(
        recipientAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }>;

    deleteStatusFromFeed(
        recipientAlias: string,
        authorAlias: string,
        timestamp: number
    ): Promise<void>;
}
