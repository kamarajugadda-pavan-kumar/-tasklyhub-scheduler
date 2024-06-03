export interface ITaskExecutionWorker<T1, T2> {
  pickTaskFromQueue(): T1;
  executeTask(task: T2): Promise<void>;
}
