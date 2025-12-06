import { SQSEvent } from "aws-lambda";
import { initializeDAOFactory } from "../InitializeDAOFactory";
import { DAOFactory } from "../../model/dao/factory/DAOFactory";

interface JobQueueMessage {
    followerAliases: string[];
    authorAlias: string;
    post: string;
    timestamp: number;
}

export const handler = async (event: SQSEvent): Promise<void> => {
    initializeDAOFactory();

    const factory = DAOFactory.getInstance();
    const feedDAO = factory.createFeedDAO();

    for (const record of event.Records) {
        const message: JobQueueMessage = JSON.parse(record.body);

        // Write to all followers' feeds in this batch
        await feedDAO.batchPutFeedItems(
            message.followerAliases,
            message.post,
            message.authorAlias,
            message.timestamp
        );
    }
};
