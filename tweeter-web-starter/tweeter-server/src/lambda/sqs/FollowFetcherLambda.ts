import { SQSEvent, SQSRecord } from "aws-lambda";
import { initializeDAOFactory } from "../InitializeDAOFactory";
import { DAOFactory } from "../../model/dao/factory/DAOFactory";
import { SQSClient } from "../../model/util/SQSClient";

interface PostQueueMessage {
    authorAlias: string;
    post: string;
    timestamp: number;
}

export const handler = async (event: SQSEvent): Promise<void> => {
    initializeDAOFactory();

    const factory = DAOFactory.getInstance();
    const followDAO = factory.createFollowDAO();
    const sqsClient = new SQSClient();
    const jobQueueUrl = process.env.JOB_QUEUE_URL!;

    for (const record of event.Records) {
        const message: PostQueueMessage = JSON.parse(record.body);

        // Get all followers
        const followerAliases = await getAllFollowerAliases(message.authorAlias, followDAO);

        // Chunk followers into batches of 25 (DynamoDB batch write limit)
        const batchSize = 25;
        for (let i = 0; i < followerAliases.length; i += batchSize) {
            const batch = followerAliases.slice(i, i + batchSize);

            // Send batch to JobQueue
            await sqsClient.sendMessage(jobQueueUrl, {
                followerAliases: batch,
                authorAlias: message.authorAlias,
                post: message.post,
                timestamp: message.timestamp,
            });
        }
    }
};

async function getAllFollowerAliases(userAlias: string, followDAO: any): Promise<string[]> {
    const allFollowers: string[] = [];
    let hasMore = true;
    let lastAlias: string | null = null;

    while (hasMore) {
        const result: { aliases: string[]; hasMore: boolean } = await followDAO.getPageOfFollowers(userAlias, 100, lastAlias);
        allFollowers.push(...result.aliases);
        hasMore = result.hasMore;
        if (result.aliases.length > 0) {
            lastAlias = result.aliases[result.aliases.length - 1];
        }
    }

    return allFollowers;
}
