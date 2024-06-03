import { DB_Updates, schedule } from "../types";

export interface ISchedulerService {
  createSchedule(schedule: schedule): Promise<void>;
  deleteSchedule(scheduleId: string): Promise<void>;
  updateSchedule(scheduleId: string, updates: DB_Updates): Promise<void>;
  getSchedule(scheduleId: string): Promise<void>;
}
