import { SQSClient as AWSSQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class SQSClient {
    private client: AWSSQSClient;

    constructor() {
        this.client = new AWSSQSClient({ region: "us-east-1" });
    }

    async sendMessage(queueUrl: string, messageBody: any): Promise<void> {
        const params = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(messageBody),
        };

        await this.client.send(new SendMessageCommand(params));
    }
}
