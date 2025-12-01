import { DAOFactory } from "../model/dao/factory/DAOFactory";
import { DynamoDAOFactory } from "../model/dao/dynamodb/DynamoDAOFactory";

export function initializeDAOFactory(): void {
    if (!DAOFactory.hasInstance()) {
        DAOFactory.setInstance(new DynamoDAOFactory());
    }
}
