import { DAOFactory } from "../model/dao/factory/DAOFactory";
import { DynamoDAOFactory } from "../model/dao/dynamodb/DynamoDAOFactory";

/**
 * Initializes the DAOFactory singleton with the DynamoDB implementation.
 * This should be called at the start of every Lambda handler.
 */
export function initializeDAOFactory(): void {
    // Only initialize once
    if (!DAOFactory.hasInstance()) {
        DAOFactory.setInstance(new DynamoDAOFactory());
    }
}
