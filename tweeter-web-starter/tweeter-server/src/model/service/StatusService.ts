import { StatusDto, Status, User } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/factory/DAOFactory";
import { StatusDAO } from "../dao/interface/StatusDAO";
import { FeedDAO } from "../dao/interface/FeedDAO";
import { FollowDAO } from "../dao/interface/FollowDAO";
import { UserDAO } from "../dao/interface/UserDAO";
import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";
import { AuthHelper } from "./AuthHelper";
import { SQSClient } from "../util/SQSClient";

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
        await this.authHelper.validateAuthToken(authToken);

        const lastTimestamp = lastItem ? lastItem.timestamp : null;
        const result = await this.feedDAO.getPageOfFeedItems(userAlias, pageSize, lastTimestamp);

        const statusDtos = await this.convertToStatusDtos(result.statuses);

        return [statusDtos, result.hasMore];
    }

    public async loadMoreStoryItems(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        await this.authHelper.validateAuthToken(authToken);

        const lastTimestamp = lastItem ? lastItem.timestamp : null;
        const result = await this.statusDAO.getPageOfStatuses(userAlias, pageSize, lastTimestamp);

        const statusDtos = await this.convertToStatusDtos(result.statuses);

        return [statusDtos, result.hasMore];
    }

    public async postStatus(
        authToken: string,
        newStatus: StatusDto
    ): Promise<void> {
        const currentUserAlias = await this.authHelper.validateAuthToken(authToken);

        if (newStatus.user.alias !== currentUserAlias) {
            throw new Error("[unauthorized] Cannot post status for another user");
        }

        // Write to author's story
        await this.statusDAO.putStatus(newStatus.post, newStatus.user.alias, newStatus.timestamp);

        // Send to PostQueue for async feed processing
        const sqsClient = new SQSClient();
        const postQueueUrl = process.env.POST_QUEUE_URL!;
        
        await sqsClient.sendMessage(postQueueUrl, {
            authorAlias: newStatus.user.alias,
            post: newStatus.post,
            timestamp: newStatus.timestamp,
        });
    }

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

    private async convertToStatusDtos(
        statuses: Array<{ post: string; authorAlias: string; timestamp: number }>
    ): Promise<StatusDto[]> {
        const statusDtoPromises = statuses.map(async (status) => {
            const user = await this.userDAO.getUser(status.authorAlias);
            if (!user) {
                throw new Error(`User not found: ${status.authorAlias}`);
            }

            const userObj = new User(
                user.firstName,
                user.lastName,
                user.alias,
                user.imageUrl
            );
            const statusObj = new Status(status.post, userObj, status.timestamp);

            return statusObj.dto;
        });

        return Promise.all(statusDtoPromises);
    }
}