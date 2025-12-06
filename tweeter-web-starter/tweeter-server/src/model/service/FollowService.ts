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
        await this.authHelper.validateAuthToken(authToken);

        const lastFolloweeAlias = lastItem ? lastItem.alias : null;
        const result = await this.followDAO.getPageOfFollowees(userAlias, pageSize, lastFolloweeAlias);

        const userDtos = await this.getUsersFromAliases(result.aliases);

        return [userDtos, result.hasMore];
    }

    public async loadMoreFollowers(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        await this.authHelper.validateAuthToken(authToken);

        const lastFollowerAlias = lastItem ? lastItem.alias : null;
        const result = await this.followDAO.getPageOfFollowers(userAlias, pageSize, lastFollowerAlias);

        const userDtos = await this.getUsersFromAliases(result.aliases);

        return [userDtos, result.hasMore];
    }

    public async getFolloweeCount(
        authToken: string,
        user: UserDto
    ): Promise<number> {
        await this.authHelper.validateAuthToken(authToken);
        return await this.userDAO.getFolloweeCount(user.alias);
    }

    public async getFollowerCount(
        authToken: string,
        user: UserDto
    ): Promise<number> {
        await this.authHelper.validateAuthToken(authToken);
        return await this.userDAO.getFollowerCount(user.alias);
    }

    public async getIsFollowerStatus(
        authToken: string,
        user: UserDto,
        selectedUser: UserDto
    ): Promise<boolean> {
        await this.authHelper.validateAuthToken(authToken);

        const follow = await this.followDAO.getFollow(user.alias, selectedUser.alias);
        return follow !== null;
    }

    public async follow(
        authToken: string,
        userToFollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        await this.followDAO.putFollow(currentUserAlias, userToFollow.alias);

        // Update counts: current user's followee count increases, target user's follower count increases
        await Promise.all([
            this.userDAO.incrementFolloweeCount(currentUserAlias),
            this.userDAO.incrementFollowerCount(userToFollow.alias)
        ]);

        const followerCount = await this.getFollowerCount(authToken, userToFollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

        return [followerCount, followeeCount];
    }

    public async unfollow(
        authToken: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        await this.followDAO.deleteFollow(currentUserAlias, userToUnfollow.alias);

        // Update counts: current user's followee count decreases, target user's follower count decreases
        await Promise.all([
            this.userDAO.decrementFolloweeCount(currentUserAlias),
            this.userDAO.decrementFollowerCount(userToUnfollow.alias)
        ]);

        const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

        return [followerCount, followeeCount];
    }

    private async getUsersFromAliases(aliases: string[]): Promise<UserDto[]> {
        const userPromises = aliases.map(alias => this.userDAO.getUser(alias));
        const users = await Promise.all(userPromises);

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