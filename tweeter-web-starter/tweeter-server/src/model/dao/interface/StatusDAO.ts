/**
 * Database-agnostic interface for Status (post) data access operations.
 */
export interface StatusDAO {
    /**
     * Stores a new status.
     * @param post The status text
     * @param authorAlias The author's alias
     * @param timestamp The status timestamp
     */
    putStatus(post: string, authorAlias: string, timestamp: number): Promise<void>;

    /**
     * Gets a paginated list of statuses for a user's story.
     * @param authorAlias The alias of the user whose story to retrieve
     * @param pageSize The maximum number of statuses to return
     * @param lastStatusTimestamp The timestamp of the last status from the previous page (null for first page)
     * @returns Object with statuses array and hasMore flag
     */
    getPageOfStatuses(
        authorAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }>;

    /**
     * Deletes a status from the database.
     * @param authorAlias The alias of the status author
     * @param timestamp The timestamp of the status to delete
     */
    deleteStatus(authorAlias: string, timestamp: number): Promise<void>;
}
