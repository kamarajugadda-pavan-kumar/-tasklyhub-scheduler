import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
  ReceiveMessageResult,
  SendMessageCommandOutput,
  DeleteMessageCommandOutput,
  GetQueueAttributesCommandOutput,
  Message,
} from "@aws-sdk/client-sqs";

import { IQueue } from "../interfaces/IQueue";

export class Queue
  implements
    IQueue<
      SendMessageCommandOutput,
      Message[] | undefined,
      DeleteMessageCommandOutput,
      GetQueueAttributesCommandOutput
    >
{
  private queueURI: string;
  private client: SQSClient;

  constructor(
    queueURI: string,
    region: string,
    credentials?: { accessKeyId: string; secretAccessKey: string }
  ) {
    this.queueURI = queueURI;
    this.client = new SQSClient({
      endpoint: queueURI,
      region,
      credentials,
    });
  }

  async enqueueMessage(message: any): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageBody: message,
      QueueUrl: this.queueURI,
    });
    try {
      let data = await this.client.send(command);
      return data;
    } catch (err) {
      console.log("Error sending message:", err);
      throw new Error("failed to push message");
    }
  }

  async deleteMessage(
    receiptHandle: string
  ): Promise<DeleteMessageCommandOutput> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueURI,
      ReceiptHandle: receiptHandle,
    });
    try {
      let data = await this.client.send(command);
      return data;
    } catch (error) {
      console.log("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }

  async pollMessages(): Promise<Message[] | undefined> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueURI,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 60,
      WaitTimeSeconds: 10,
    });
    try {
      let data = await this.client.send(command);
      return data.Messages;
    } catch (error) {
      console.log("Error receiving message:", error);
      throw new Error("failed to receive message");
    }
  }

  async queueAttributes(): Promise<GetQueueAttributesCommandOutput> {
    const command = new GetQueueAttributesCommand({
      QueueUrl: this.queueURI,
      AttributeNames: ["All"],
    });
    try {
      let data = await this.client.send(command);
      return data;
    } catch (error) {
      console.log("Error getting queue length:", error);
      throw new Error("failed to get queue attributes");
    }
  }
}
