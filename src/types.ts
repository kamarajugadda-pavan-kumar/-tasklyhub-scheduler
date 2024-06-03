import { ObjectId } from "mongodb";

export interface QueryParameters {
  [key: string]: string;
}

export interface Body {
  [key: string]: any;
}

export interface DB_Updates {
  [key: string]: any;
}

export type schedule = {
  _id?: ObjectId;
  id: string;
  type: "API" | "callback";

  scheduleData: {
    start_date: string;
    end_date: string;
    timeZone: string;
    time_of_day: string;
    am_pm: "AM" | "PM";
    repeat_interval: {
      number: number;
      unit: "days";
    };
  };
  payload: {
    method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
    url: string;
    headers?: Headers;
    queryParameters?: QueryParameters;
    body?: Body;

    callbackName?: string;
    callbackArguments?: any[];
  };
  metadata?: {
    created_by: string;
    status: "scheduled" | "running" | "completed" | "failed";
    created_at: Date;
    updated_at: Date;
  };

  start_date?: string;
  end_date?: string;
  next_schedule_time?: string | Date;
  no_of_fails?: number;
  repeat_interval?: {
    number: number;
    unit: repeatIntervalUnitType;
  };
};

export type repeatIntervalUnitType =
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year";

export type Callback = (...args: any[]) => any;
