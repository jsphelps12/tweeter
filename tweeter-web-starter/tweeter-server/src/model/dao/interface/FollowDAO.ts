export interface FollowDAO {

    putFollow(followerAlias: string, followeeAlias: string): Promise<void>;

    deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;

    getFollow(followerAlias: string, followeeAlias: string): Promise<{ followerAlias: string; followeeAlias: string } | null>;

    getPageOfFollowees(
        followerAlias: string,
        pageSize: number,
        lastFolloweeAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }>;

    getPageOfFollowers(
        followeeAlias: string,
        pageSize: number,
        lastFollowerAlias: string | null
    ): Promise<{ aliases: string[]; hasMore: boolean }>;
}
