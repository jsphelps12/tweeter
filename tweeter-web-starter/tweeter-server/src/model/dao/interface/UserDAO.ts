export interface UserDAO {
    putUser(
        firstName: string,
        lastName: string,
        alias: string,
        hashedPassword: string,
        imageUrl: string
    ): Promise<void>;

    getUser(alias: string): Promise<{ firstName: string; lastName: string; alias: string; imageUrl: string } | null>;

    getPasswordHash(alias: string): Promise<string | null>;

    updateUser(
        alias: string,
        firstName?: string,
        lastName?: string,
        imageUrl?: string
    ): Promise<void>;

    deleteUser(alias: string): Promise<void>;

    getFollowerCount(alias: string): Promise<number>;

    getFolloweeCount(alias: string): Promise<number>;

    incrementFollowerCount(alias: string): Promise<void>;

    decrementFollowerCount(alias: string): Promise<void>;

    incrementFolloweeCount(alias: string): Promise<void>;

    decrementFolloweeCount(alias: string): Promise<void>;
}
