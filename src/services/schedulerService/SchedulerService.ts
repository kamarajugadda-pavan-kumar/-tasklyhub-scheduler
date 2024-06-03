import { v4 as uuidV4 } from "uuid";
import { IDatabase } from "../../interfaces/IDatabase";
import { ISchedulerService } from "../../interfaces/ISchedulerService";
import { Queue } from "../../queue";
import { DB_Updates, schedule } from "../../types";

export class SchedulerService implements ISchedulerService {
  private queue: Queue;
  private database: IDatabase;

  constructor(queue: Queue, database: IDatabase) {
    this.queue = queue;
    this.database = database;
  }
  async createSchedule(schedule: schedule): Promise<void> {
    try {
      schedule.id = uuidV4();
      schedule.metadata = {
        created_by: "",
        status: "scheduled",
        created_at: new Date(),
        updated_at: new Date(),
      };
      await this.queue.enqueueMessage(JSON.stringify(schedule));
    } catch (error) {
      console.log(error);
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      const query = { id: scheduleId };
      await this.database.delete(query);
    } catch (error) {
      console.log(error);
    }
  }

  async updateSchedule(scheduleId: string, updates: DB_Updates): Promise<void> {
    try {
      const query = { id: scheduleId };
      await this.database.update(query, updates);
    } catch (error) {
      console.log(error);
    }
  }

  async getSchedule(scheduleId: string): Promise<void> {
    try {
      const query = { id: scheduleId };
      await this.database.get(query);
    } catch (error) {
      console.log(error);
    }
  }
}
