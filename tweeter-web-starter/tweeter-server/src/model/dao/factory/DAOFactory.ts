import { AuthTokenDAO } from "../interface/AuthTokenDAO";
import { FeedDAO } from "../interface/FeedDAO";
import { FollowDAO } from "../interface/FollowDAO";
import { ImageDAO } from "../interface/ImageDAO";
import { StatusDAO } from "../interface/StatusDAO";
import { UserDAO } from "../interface/UserDAO";

export abstract class DAOFactory {
    private static instance: DAOFactory;

    public static getInstance(): DAOFactory {
        if (!DAOFactory.instance) {
            throw new Error("DAOFactory instance not set. Call setInstance() first.");
        }
        return DAOFactory.instance;
    }

    public static setInstance(factory: DAOFactory): void {
        DAOFactory.instance = factory;
    }

    public static hasInstance(): boolean {
        return DAOFactory.instance !== undefined;
    }

    abstract createUserDAO(): UserDAO;
    abstract createAuthTokenDAO(): AuthTokenDAO;
    abstract createFollowDAO(): FollowDAO;
    abstract createStatusDAO(): StatusDAO;
    abstract createFeedDAO(): FeedDAO;
    abstract createImageDAO(): ImageDAO;
}
