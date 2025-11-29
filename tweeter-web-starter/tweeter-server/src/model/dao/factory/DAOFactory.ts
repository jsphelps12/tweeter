import { AuthTokenDAO } from "../interface/AuthTokenDAO";
import { FeedDAO } from "../interface/FeedDAO";
import { FollowDAO } from "../interface/FollowDAO";
import { ImageDAO } from "../interface/ImageDAO";
import { StatusDAO } from "../interface/StatusDAO";
import { UserDAO } from "../interface/UserDAO";

/**
 * Abstract factory for creating DAO instances.
 * Allows the service layer to remain database-agnostic.
 */
export abstract class DAOFactory {
    private static instance: DAOFactory;

    /**
     * Gets the singleton factory instance.
     */
    public static getInstance(): DAOFactory {
        if (!DAOFactory.instance) {
            // For now, we'll set this in the concrete implementation
            // This will be replaced with DynamoDAOFactory once implemented
            throw new Error("DAOFactory instance not set. Call setInstance() first.");
        }
        return DAOFactory.instance;
    }

    /**
     * Sets the factory instance (used for testing or switching implementations).
     */
    public static setInstance(factory: DAOFactory): void {
        DAOFactory.instance = factory;
    }

    /**
     * Checks if the factory instance has been set.
     */
    public static hasInstance(): boolean {
        return DAOFactory.instance !== undefined;
    }

    // Factory methods for creating DAOs
    abstract createUserDAO(): UserDAO;
    abstract createAuthTokenDAO(): AuthTokenDAO;
    abstract createFollowDAO(): FollowDAO;
    abstract createStatusDAO(): StatusDAO;
    abstract createFeedDAO(): FeedDAO;
    abstract createImageDAO(): ImageDAO;
}
