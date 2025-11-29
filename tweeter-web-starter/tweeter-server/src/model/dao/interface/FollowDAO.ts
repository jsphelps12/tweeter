/**
 * Database-agnostic interface for Follow relationship data access operations.
 */
export interface FollowDAO {
    /**
     * Creates a follow relationship.
     * @param followerAlias The alias of the user who is following
     * @param followeeAlias The alias of the user being followed
     */
    putFollow(followerAlias: string, followeeAlias: string): Promise<void>;

    /**
     * Deletes a follow relationship.
     * @param followerAlias The alias of the user who is unfollowing
     * @param followeeAlias The alias of the user being unfollowed
     */
    deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;

    /**
     * Gets a follow relationship.
     * @param followerAlias The alias of the follower
     * @param followeeAlias The alias of the followee
     * @returns The follow data or null if not found
     */
    getFollow(followerAlias: string, followeeAlias: string): Promise<{ followerAlias: string; followeeAlias: string } | null>;

    /**
     * Gets paginated followees (users that followerAlias follows).
     * @param followerAlias The follower's alias
     * @param pageSize Maximum number of items to return
     * @param lastFolloweeAlias Last item from previous page (null for first page)
     * @returns Array of followee aliases and hasMore flag
     */
    getPageOfFollowees(
        followerAlias: string,
        pageSize: number,
        lastFolloweeAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }>;

    /**
     * Gets paginated followers (users that follow followeeAlias).
     * @param followeeAlias The followee's alias
     * @param pageSize Maximum number of items to return
     * @param lastFollowerAlias Last item from previous page (null for first page)
     * @returns Array of follower aliases and hasMore flag
     */
    getPageOfFollowers(
        followeeAlias: string,
        pageSize: number,
        lastFollowerAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }>;
}
