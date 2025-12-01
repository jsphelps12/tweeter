export interface StatusDAO {

    putStatus(post: string, authorAlias: string, timestamp: number): Promise<void>;

    getPageOfStatuses(
        authorAlias: string,
        pageSize: number,
        lastStatusTimestamp: number | null
    ): Promise<{ statuses: Array<{ post: string; authorAlias: string; timestamp: number }>; hasMore: boolean }>;

    deleteStatus(authorAlias: string, timestamp: number): Promise<void>;
}
