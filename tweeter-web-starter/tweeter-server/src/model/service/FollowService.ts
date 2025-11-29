import { UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/factory/DAOFactory";
import { FollowDAO } from "../dao/interface/FollowDAO";
import { UserDAO } from "../dao/interface/UserDAO";
import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";
import { AuthHelper } from "./AuthHelper";

export class FollowService implements Service {
    private followDAO: FollowDAO;
    private userDAO: UserDAO;
    private authTokenDAO: AuthTokenDAO;
    private authHelper: AuthHelper;

    constructor() {
        const factory = DAOFactory.getInstance();
        this.followDAO = factory.createFollowDAO();
        this.userDAO = factory.createUserDAO();
        this.authTokenDAO = factory.createAuthTokenDAO();
        this.authHelper = new AuthHelper(this.authTokenDAO);
    }

    public async loadMoreFollowees(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get followee aliases from FollowDAO
        const lastFolloweeAlias = lastItem ? lastItem.alias : null;
        const result = await this.followDAO.getPageOfFollowees(userAlias, pageSize, lastFolloweeAlias);

        // Convert aliases to UserDtos
        const userDtos = await this.getUsersFromAliases(result.aliases);

        return [userDtos, result.hasMore];
    }

    public async loadMoreFollowers(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get follower aliases from FollowDAO
        const lastFollowerAlias = lastItem ? lastItem.alias : null;
        const result = await this.followDAO.getPageOfFollowers(userAlias, pageSize, lastFollowerAlias);

        // Convert aliases to UserDtos
        const userDtos = await this.getUsersFromAliases(result.aliases);

        return [userDtos, result.hasMore];
    }

    public async getFolloweeCount(
        authToken: string,
        user: UserDto
    ): Promise<number> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get all followees and count them
        let count = 0;
        let hasMore = true;
        let lastAlias: string | null = null;

        while (hasMore) {
            const result = await this.followDAO.getPageOfFollowees(user.alias, 100, lastAlias);
            count += result.aliases.length;
            hasMore = result.hasMore;
            if (result.aliases.length > 0) {
                lastAlias = result.aliases[result.aliases.length - 1];
            }
        }

        return count;
    }

    public async getFollowerCount(
        authToken: string,
        user: UserDto
    ): Promise<number> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get all followers and count them
        let count = 0;
        let hasMore = true;
        let lastAlias: string | null = null;

        while (hasMore) {
            const result = await this.followDAO.getPageOfFollowers(user.alias, 100, lastAlias);
            count += result.aliases.length;
            hasMore = result.hasMore;
            if (result.aliases.length > 0) {
                lastAlias = result.aliases[result.aliases.length - 1];
            }
        }

        return count;
    }

    public async getIsFollowerStatus(
        authToken: string,
        user: UserDto,
        selectedUser: UserDto
    ): Promise<boolean> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Check if follow relationship exists
        const follow = await this.followDAO.getFollow(user.alias, selectedUser.alias);
        return follow !== null;
    }

    public async follow(
        authToken: string,
        userToFollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Validate auth token and get current user's alias
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        // Create follow relationship
        await this.followDAO.putFollow(currentUserAlias, userToFollow.alias);

        // Get updated counts for the user being followed
        const followerCount = await this.getFollowerCount(authToken, userToFollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

        return [followerCount, followeeCount];
    }

    public async unfollow(
        authToken: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Validate auth token and get current user's alias
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        // Delete follow relationship
        await this.followDAO.deleteFollow(currentUserAlias, userToUnfollow.alias);

        // Get updated counts for the user being unfollowed
        const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

        return [followerCount, followeeCount];
    }

    /**
     * Converts an array of aliases to UserDto objects.
     */
    private async getUsersFromAliases(aliases: string[]): Promise<UserDto[]> {
        const userPromises = aliases.map(alias => this.userDAO.getUser(alias));
        const users = await Promise.all(userPromises);

        // Filter out nulls and convert to UserDto
        return users
            .filter(user => user !== null)
            .map(user => ({
                firstName: user!.firstName,
                lastName: user!.lastName,
                alias: user!.alias,
                imageUrl: user!.imageUrl
            }));
    }
}