import { Message } from "@aws-sdk/client-sqs";
import { ITaskExecutionWorker } from "../../interfaces/ITaskExecutionWorker";
import { Queue } from "../../queue";
import { schedule } from "../../types";
import { CallbackRegistry } from "../../callbackRegistry";
import { DateTime, Interval } from "luxon";

export class TaskExecutorWorker
  implements ITaskExecutionWorker<Promise<Message[] | undefined>, Message>
{
  private queue: Queue;
  private callbackRegistry: CallbackRegistry;

  constructor(queue: Queue) {
    this.queue = queue;
    this.callbackRegistry = CallbackRegistry.getInstance();
  }

  startExecutorWorker() {
    setInterval(async () => {
      const tasks = await this.pickTaskFromQueue();
      if (tasks && tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          await this.executeTask(tasks[i]);
          await this.queue.deleteMessage(tasks[i].ReceiptHandle!);
        }
      }
    }, 60 * 1000);
  }

  async pickTaskFromQueue(): Promise<Message[] | undefined> {
    const executables = await this.queue.pollMessages();
    return executables;
  }

  async executeTask(task: Message): Promise<void> {
    let messageBody: schedule = task.Body ? JSON.parse(task.Body) : undefined;
    if (messageBody) {
      if (messageBody.type == "callback") {
        let args = messageBody.payload.callbackArguments;
        if (messageBody.payload.callbackName && args) {
          const callback = this.callbackRegistry.getCallback(
            messageBody.payload.callbackName
          );
          const interval = Interval.fromDateTimes(
            DateTime.utc(),
            // @ts-ignore
            DateTime.fromISO(messageBody.next_schedule_time, { zone: "utc" })
          );
          const timeout = interval.length("milliseconds");
          callback &&
            setTimeout(() => {
              callback(...args);
              console.log(new Date());
            }, timeout);
        }
      } else if (messageBody.type == "API") {
        console.log("API call");
      }
    }
  }
}
