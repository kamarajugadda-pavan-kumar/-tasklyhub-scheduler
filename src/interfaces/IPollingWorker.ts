import { ObjectId } from "mongodb";
import { schedule } from "../types";

export interface IPollingWorker<T1, T2, T3> {
  getSchedulesDueInNextInterval(): Promise<T1>;
  updateNextSchedule(id: T3, schedule: schedule): Promise<T2>;
}
