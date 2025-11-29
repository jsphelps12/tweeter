/**
 * Database-agnostic interface for Feed data access operations.
 * Feed is pre-computed and stored for each user for fast retrieval.
 */
export interface FeedDAO {
    /**
     * Adds a status to a user's feed.
     * @param recipientAlias The alias of the user whose feed to update
     * @param post The status text
     * @param authorAlias The author's alias
     * @param timestamp The status timestamp
     */
    putFeedItem(recipientAlias: string, post: string, authorAlias: string, timestamp: number): Promise<void>;

    /**
     * Adds a status to multiple users' feeds in batch.
     * @param recipientAliases Array of user aliases whose feeds to update
     * @param post The status text
     * @param authorAlias The author's alias
     * @param timestamp The status timestamp
     */
    batchPutFeedItems(recipientAliases: string[], post: string, authorAlias: string, timestamp: number): Promise<void>;

    /**
     * Gets a paginated list of statuses from a user's feed.
     * @param recipientAlias The alias of the user whose feed to retrieve
     * @param pageSize The maximum number of statuses to return
     * @param lastStatusTimestamp The timestamp of the last status from the previous page (null for first page)
     * @returns Object with statuses array and hasMore flag
     */
    getPageOfFeedItems(
        recipientAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }>;

    /**
     * Deletes a status from a user's feed.
     * @param recipientAlias The alias of the user whose feed to update
     * @param authorAlias The alias of the status author
     * @param timestamp The timestamp of the status to delete
     */
    deleteStatusFromFeed(
        recipientAlias: string,
        authorAlias: string,
        timestamp: number
    ): Promise<void>;
}
