import { Message } from "@aws-sdk/client-sqs";
import { IDatabase } from "../../interfaces/IDatabase";
import { IProcessorWorker } from "../../interfaces/IProcessorWorker";
import { Queue } from "../../queue/queue";

import {
  extractDateComponents,
  convertTo24HourFormat,
} from "../../date-time-utils/utils";
import ZonedDateTime from "../../date-time-utils/ZonedDateTime";

export class ProcessorWorker
  implements IProcessorWorker<Message, void, void, Message[] | undefined>
{
  private queue: Queue;
  private database: IDatabase;

  constructor(queue: Queue, database: IDatabase) {
    this.queue = queue;
    this.database = database;
  }

  async startWorker(): Promise<void> {
    this.database.connect();
    setInterval(async () => {
      const schedules = await this.fetchSchedulesFromQueueForProcessing();
      if (schedules && schedules.length > 0) {
        for (let i = 0; i < schedules.length; i++) {
          const processedSchedule = await this.processSchedule(schedules[i]);
        }
      } else {
        console.log("No messages in queue1");
      }
    }, 60 * 1000);
  }

  async fetchSchedulesFromQueueForProcessing(): Promise<Message[] | undefined> {
    try {
      const data = await this.queue.pollMessages();
      return data;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async processSchedule(schedule: Message): Promise<any> {
    let messageBody = schedule.Body ? JSON.parse(schedule.Body) : undefined;
    try {
      //----------------------------------------------------------------
      //process the message and store it in the db
      //----------------------------------------------------------------
      const { scheduleData, ...rest } = messageBody;

      const scheduleDocument = { ...rest };
      const {
        start_date,
        end_date,
        timeZone,
        time_of_day,
        am_pm,
        repeat_interval,
      } = scheduleData;
      const {
        year: startYear,
        month: startMonth,
        day: startDay,
      } = extractDateComponents(start_date, "MM/dd/yyyy");
      const {
        year: endYear,
        month: endMonth,
        day: endDay,
      } = extractDateComponents(end_date, "MM/dd/yyyy");
      const { hour, minute } = convertTo24HourFormat(time_of_day + " " + am_pm);

      scheduleDocument.start_date = new Date(
        new ZonedDateTime(
          startYear,
          startMonth,
          startDay,
          0,
          0,
          timeZone
        ).getUTCString()
      );

      scheduleDocument.end_date = new Date(
        new ZonedDateTime(
          endYear,
          endMonth,
          endDay,
          23,
          59,
          timeZone
        ).getUTCString()
      );

      scheduleDocument.next_schedule_time = new Date(
        new ZonedDateTime(
          startYear,
          startMonth,
          startDay,
          hour,
          minute,
          timeZone
        ).getUTCString()
      );

      scheduleDocument.no_of_fails = 0;
      scheduleDocument.repeat_interval = repeat_interval;

      await this.insertProcessedScheduleInDatabase(scheduleDocument);
    } catch (err) {
      console.log(err);
      // log the message in the queue for debugging
    } finally {
      if (schedule.ReceiptHandle) {
        await this.queue.deleteMessage(schedule.ReceiptHandle);
      }
    }
  }

  async insertProcessedScheduleInDatabase(schedule: any): Promise<void> {
    try {
      let data = await this.database.insert(schedule);
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  async removeProcessedScheduleFromQueue(ReceiptHandle: string) {
    try {
      this.queue.deleteMessage(ReceiptHandle);
    } catch (error) {
      console.log(error);
    }
  }
}
