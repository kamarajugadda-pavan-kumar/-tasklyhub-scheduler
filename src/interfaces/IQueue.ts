export interface IQueue<
  TSendMessageOutput,
  TReceiveMessageResult,
  TDeleteMessageOutput,
  TQueueAttributesOutput
> {
  enqueueMessage(message: any): Promise<TSendMessageOutput>;
  pollMessages(): Promise<TReceiveMessageResult>;
  deleteMessage(receiptHandle: string): Promise<TDeleteMessageOutput>;
  queueAttributes(): Promise<TQueueAttributesOutput>;
}
