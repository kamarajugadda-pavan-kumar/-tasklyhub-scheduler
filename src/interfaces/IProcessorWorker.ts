export interface IProcessorWorker<T, T1, T2, T3> {
  startWorker(): void;
  processSchedule(schedule: T): Promise<T1>;
  insertProcessedScheduleInDatabase(schedule: any): Promise<T2>;
  fetchSchedulesFromQueueForProcessing(): Promise<T3>;
  removeProcessedScheduleFromQueue(ReceiptHandle: string): Promise<void>;
}
