import { DateTime } from "luxon";

import { MongoDB } from "../../database";
import { Queue } from "../../queue";
import { IPollingWorker } from "../../interfaces/IPollingWorker";
import { schedule } from "../../types";
import {
  calcMillisecsRepeatIntv,
  generateUtcTimestampWithOffset,
} from "../../date-time-utils/utils";
import { ObjectId } from "mongodb";

export class PollingWorker
  implements IPollingWorker<schedule[] | undefined, void, ObjectId>
{
  private queue: Queue;
  private database: MongoDB;

  constructor(queue: Queue, database: MongoDB) {
    this.queue = queue;
    this.database = database;
  }

  async startWorker() {
    await this.database.connect();
    setInterval(async () => {
      // pick probable records from database
      let schedules = await this.getSchedulesDueInNextInterval();

      if (!schedules) return;
      for (let i = 0; i < schedules.length; i++) {
        // drop them in the queue
        await this.queue.enqueueMessage(JSON.stringify(schedules[i]));

        // update next_schedule_time in database
        if (
          schedules[i] &&
          schedules[i].next_schedule_time &&
          schedules[i].repeat_interval !== undefined
        ) {
          schedules[i].next_schedule_time = new Date(
            generateUtcTimestampWithOffset(
              new Date(schedules[i].next_schedule_time!).toISOString(),
              calcMillisecsRepeatIntv(
                schedules[i].repeat_interval!.unit,
                schedules[i].repeat_interval!.number
              )
            )
          );
        }
        await this.updateNextSchedule(schedules[i]._id!, schedules[i]);
      }
    }, 60 * 1000);
  }

  async getSchedulesDueInNextInterval(): Promise<schedule[] | undefined> {
    try {
      const currentTime = DateTime.utc();
      const fiveMinutesLater = currentTime.plus({ minutes: 5 });
      const query = {
        start_date: { $lte: currentTime.toJSDate() },
        end_date: { $gte: currentTime.toJSDate() },
        next_schedule_time: {
          $gte: currentTime.toJSDate(),
          $lte: fiveMinutesLater.toJSDate(),
        },
      };

      const result = await this.database.get(query);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async updateNextSchedule(id: ObjectId, schedule: schedule): Promise<void> {
    try {
      const query = { _id: id };
      const updates = { next_schedule_time: schedule.next_schedule_time };
      this.database.update(query, updates);
    } catch (error) {
      console.log(error);
    }
  }
}
