import { DAOFactory } from "../factory/DAOFactory";
import { AuthTokenDAO } from "../interface/AuthTokenDAO";
import { FeedDAO } from "../interface/FeedDAO";
import { FollowDAO } from "../interface/FollowDAO";
import { ImageDAO } from "../interface/ImageDAO";
import { StatusDAO } from "../interface/StatusDAO";
import { UserDAO } from "../interface/UserDAO";
import { DynamoAuthTokenDAO } from "./DynamoAuthTokenDAO";
import { DynamoFeedDAO } from "./DynamoFeedDAO";
import { DynamoFollowDAO } from "./DynamoFollowDAO";
import { DynamoStatusDAO } from "./DynamoStatusDAO";
import { DynamoUserDAO } from "./DynamoUserDAO";
import { S3ImageDAO } from "./S3ImageDAO";

/**
 * Concrete factory for creating DynamoDB DAO instances.
 */
export class DynamoDAOFactory extends DAOFactory {
    createUserDAO(): UserDAO {
        return new DynamoUserDAO();
    }

    createAuthTokenDAO(): AuthTokenDAO {
        return new DynamoAuthTokenDAO();
    }

    createFollowDAO(): FollowDAO {
        return new DynamoFollowDAO();
    }

    createStatusDAO(): StatusDAO {
        return new DynamoStatusDAO();
    }

    createFeedDAO(): FeedDAO {
        return new DynamoFeedDAO();
    }

    createImageDAO(): ImageDAO {
        return new S3ImageDAO();
    }
}
