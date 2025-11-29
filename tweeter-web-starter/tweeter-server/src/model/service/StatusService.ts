import { StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/factory/DAOFactory";
import { StatusDAO } from "../dao/interface/StatusDAO";
import { FeedDAO } from "../dao/interface/FeedDAO";
import { FollowDAO } from "../dao/interface/FollowDAO";
import { UserDAO } from "../dao/interface/UserDAO";
import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";
import { AuthHelper } from "./AuthHelper";

export class StatusService implements Service {
    private statusDAO: StatusDAO;
    private feedDAO: FeedDAO;
    private followDAO: FollowDAO;
    private userDAO: UserDAO;
    private authTokenDAO: AuthTokenDAO;
    private authHelper: AuthHelper;

    constructor() {
        const factory = DAOFactory.getInstance();
        this.statusDAO = factory.createStatusDAO();
        this.feedDAO = factory.createFeedDAO();
        this.followDAO = factory.createFollowDAO();
        this.userDAO = factory.createUserDAO();
        this.authTokenDAO = factory.createAuthTokenDAO();
        this.authHelper = new AuthHelper(this.authTokenDAO);
    }

    public async loadMoreFeedItems(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get feed items from FeedDAO
        const lastTimestamp = lastItem ? lastItem.timestamp : null;
        const result = await this.feedDAO.getPageOfFeedItems(userAlias, pageSize, lastTimestamp);

        // Convert raw status data to StatusDtos with full user info
        const statusDtos = await this.convertToStatusDtos(result.statuses);

        return [statusDtos, result.hasMore];
    }

    public async loadMoreStoryItems(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // Validate auth token
        await this.authHelper.validateAuthToken(authToken);

        // Get story items from StatusDAO
        const lastTimestamp = lastItem ? lastItem.timestamp : null;
        const result = await this.statusDAO.getPageOfStatuses(userAlias, pageSize, lastTimestamp);

        // Convert raw status data to StatusDtos with full user info
        const statusDtos = await this.convertToStatusDtos(result.statuses);

        return [statusDtos, result.hasMore];
    }

    public async postStatus(
        authToken: string,
        newStatus: StatusDto
    ): Promise<void> {
        // Validate auth token and get current user alias
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        // Verify the status is being posted by the authenticated user
        if (newStatus.user.alias !== currentUserAlias) {
            throw new Error("[Unauthorized] Cannot post status for another user");
        }

        // Store the status in StatusDAO (for user's story)
        await this.statusDAO.putStatus(newStatus.post, newStatus.user.alias, newStatus.timestamp);

        // Get all followers to distribute the status to their feeds
        const followerAliases = await this.getAllFollowerAliases(currentUserAlias);

        // Add status to all followers' feeds
        if (followerAliases.length > 0) {
            await this.feedDAO.batchPutFeedItems(
                followerAliases,
                newStatus.post,
                newStatus.user.alias,
                newStatus.timestamp
            );
        }
    }

    /**
     * Gets all follower aliases for a user (for feed distribution).
     */
    private async getAllFollowerAliases(userAlias: string): Promise<string[]> {
        const allFollowers: string[] = [];
        let hasMore = true;
        let lastAlias: string | null = null;

        while (hasMore) {
            const result = await this.followDAO.getPageOfFollowers(userAlias, 100, lastAlias);
            allFollowers.push(...result.aliases);
            hasMore = result.hasMore;
            if (result.aliases.length > 0) {
                lastAlias = result.aliases[result.aliases.length - 1];
            }
        }

        return allFollowers;
    }

    /**
     * Converts raw status data to StatusDto objects with full user information.
     */
    private async convertToStatusDtos(
        statuses: Array<{ post: string; authorAlias: string; timestamp: number }>
    ): Promise<StatusDto[]> {
        const statusDtoPromises = statuses.map(async (status) => {
            const user = await this.userDAO.getUser(status.authorAlias);
            if (!user) {
                throw new Error(`User not found: ${status.authorAlias}`);
            }

            return {
                post: status.post,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    alias: user.alias,
                    imageUrl: user.imageUrl
                },
                timestamp: status.timestamp,
                segments: [] // Segments will be computed on the client side
            };
        });

        return Promise.all(statusDtoPromises);
    }
}