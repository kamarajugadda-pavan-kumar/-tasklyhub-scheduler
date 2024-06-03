var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/database/Mongodb.ts
import { MongoClient } from "mongodb";
var MongoDB = class {
  constructor(uri, dbName, collectionName) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
    this.collectionName = collectionName;
  }
  connect() {
    return __async(this, null, function* () {
      yield this.client.connect();
      this.db = this.client.db(this.dbName);
    });
  }
  disconnect() {
    return __async(this, null, function* () {
      yield this.client.close();
    });
  }
  insert(record, collection) {
    return __async(this, null, function* () {
      if (!collection) {
        collection = this.collectionName;
      }
      yield this.db.collection(collection).insertOne(record);
    });
  }
  delete(query, collection) {
    return __async(this, null, function* () {
      if (!collection) {
        collection = this.collectionName;
      }
      yield this.db.collection(collection).deleteOne(query);
    });
  }
  update(query, updates, collection) {
    return __async(this, null, function* () {
      if (!collection) {
        collection = this.collectionName;
      }
      yield this.db.collection(collection).updateOne(query, { $set: updates });
    });
  }
  get(query, collection) {
    return __async(this, null, function* () {
      if (!collection) {
        collection = this.collectionName;
      }
      return yield this.db.collection(collection).find(query).toArray();
    });
  }
};

// src/database/MySQL.ts
import { createConnection } from "mysql2/promise";
var MySQL = class {
  constructor(config) {
    this.config = config;
  }
  connect() {
    return __async(this, null, function* () {
      this.connection = yield createConnection(this.config);
    });
  }
  disconnect() {
    return __async(this, null, function* () {
      yield this.connection.end();
    });
  }
  insert(record) {
    return __async(this, null, function* () {
      const keys = Object.keys(record).join(", ");
      const values = Object.values(record).map(() => "?").join(", ");
      yield this.connection.execute(
        `INSERT INTO yourTable (${keys}) VALUES (${values})`,
        Object.values(record)
      );
    });
  }
  delete(query) {
    return __async(this, null, function* () {
      const [key, value] = Object.entries(query)[0];
      yield this.connection.execute(`DELETE FROM yourTable WHERE ${key} = ?`, [
        value
      ]);
    });
  }
  update(query, updates) {
    return __async(this, null, function* () {
      const [key, value] = Object.entries(query)[0];
      const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
      yield this.connection.execute(
        `UPDATE yourTable SET ${setClause} WHERE ${key} = ?`,
        [...Object.values(updates), value]
      );
    });
  }
  get(query) {
    return __async(this, null, function* () {
      const [key, value] = Object.entries(query)[0];
      const [rows] = yield this.connection.execute(
        `SELECT * FROM yourTable WHERE ${key} = ?`,
        [value]
      );
      return rows;
    });
  }
};

// src/queue/queue.ts
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand
} from "@aws-sdk/client-sqs";
var Queue = class {
  constructor(queueURI, region, credentials) {
    this.queueURI = queueURI;
    this.client = new SQSClient({
      endpoint: queueURI,
      region,
      credentials
    });
  }
  enqueueMessage(message) {
    return __async(this, null, function* () {
      const command = new SendMessageCommand({
        MessageBody: message,
        QueueUrl: this.queueURI
      });
      try {
        let data = yield this.client.send(command);
        return data;
      } catch (err) {
        console.log("Error sending message:", err);
        throw new Error("failed to push message");
      }
    });
  }
  deleteMessage(receiptHandle) {
    return __async(this, null, function* () {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueURI,
        ReceiptHandle: receiptHandle
      });
      try {
        let data = yield this.client.send(command);
        return data;
      } catch (error) {
        console.log("Error deleting message:", error);
        throw new Error("Failed to delete message");
      }
    });
  }
  pollMessages() {
    return __async(this, null, function* () {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueURI,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 10
      });
      try {
        let data = yield this.client.send(command);
        return data.Messages;
      } catch (error) {
        console.log("Error receiving message:", error);
        throw new Error("failed to receive message");
      }
    });
  }
  queueAttributes() {
    return __async(this, null, function* () {
      const command = new GetQueueAttributesCommand({
        QueueUrl: this.queueURI,
        AttributeNames: ["All"]
      });
      try {
        let data = yield this.client.send(command);
        return data;
      } catch (error) {
        console.log("Error getting queue length:", error);
        throw new Error("failed to get queue attributes");
      }
    });
  }
};

// src/date-time-utils/utils.ts
import { DateTime, Interval } from "luxon";
var extractDateComponents = (dateString, format) => {
  const dt = DateTime.fromFormat(dateString, format);
  if (!dt.isValid) {
    throw new Error("Invalid date format");
  }
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day
  };
};
var convertTo24HourFormat = (timeString) => {
  const time = DateTime.fromFormat(timeString, "h:mm a");
  if (!time.isValid) {
    throw new Error("Invalid time format");
  }
  const formattedTime = time.toFormat("HH:mm");
  const hour = parseInt(time.hour.toString().padStart(2, "0"));
  const minute = parseInt(time.minute.toString().padStart(2, "0"));
  return { hour, minute, formattedTime };
};
var calcMillisecsRepeatIntv = (repeatIntervalUnit, repeatIntervalNumber) => {
  const now = DateTime.utc();
  const end = now.plus({ [repeatIntervalUnit]: repeatIntervalNumber });
  const interval = Interval.fromDateTimes(now, end);
  return interval.length("milliseconds");
};
var generateUtcTimestampWithOffset = (utcTimestamp, milliseconds) => {
  const dt = DateTime.fromISO(utcTimestamp, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error("Invalid UTC timestamp format");
  }
  const newDt = DateTime.fromMillis(dt.toMillis() + milliseconds, {
    zone: "utc"
  });
  return newDt.toUTC().toString();
};

// src/date-time-utils/ZonedDateTime.ts
import { DateTime as DateTime2 } from "luxon";
var ZonedDateTime = class {
  constructor(year, month, day, hour = 0, minute = 0, zone) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.zone = zone;
    this.dateTime = DateTime2.fromObject(
      {
        year,
        month,
        day,
        hour,
        minute
      },
      { zone }
    );
  }
  getDateTime() {
    return this.dateTime;
  }
  getZone() {
    return this.zone;
  }
  getUTCString() {
    return this.dateTime.toUTC().toString();
  }
};
var ZonedDateTime_default = ZonedDateTime;

// src/services/processorWorker/ProcessorWorker.ts
var ProcessorWorker = class {
  constructor(queue, database) {
    this.queue = queue;
    this.database = database;
  }
  startWorker() {
    return __async(this, null, function* () {
      this.database.connect();
      setInterval(() => __async(this, null, function* () {
        const schedules = yield this.fetchSchedulesFromQueueForProcessing();
        if (schedules && schedules.length > 0) {
          for (let i = 0; i < schedules.length; i++) {
            const processedSchedule = yield this.processSchedule(schedules[i]);
          }
        } else {
          console.log("No messages in queue1");
        }
      }), 60 * 1e3);
    });
  }
  fetchSchedulesFromQueueForProcessing() {
    return __async(this, null, function* () {
      try {
        const data = yield this.queue.pollMessages();
        return data;
      } catch (err) {
        console.log(err);
        return void 0;
      }
    });
  }
  processSchedule(schedule) {
    return __async(this, null, function* () {
      let messageBody = schedule.Body ? JSON.parse(schedule.Body) : void 0;
      try {
        const _a = messageBody, { scheduleData } = _a, rest = __objRest(_a, ["scheduleData"]);
        const scheduleDocument = __spreadValues({}, rest);
        const {
          start_date,
          end_date,
          timeZone,
          time_of_day,
          am_pm,
          repeat_interval
        } = scheduleData;
        const {
          year: startYear,
          month: startMonth,
          day: startDay
        } = extractDateComponents(start_date, "MM/dd/yyyy");
        const {
          year: endYear,
          month: endMonth,
          day: endDay
        } = extractDateComponents(end_date, "MM/dd/yyyy");
        const { hour, minute } = convertTo24HourFormat(time_of_day + " " + am_pm);
        scheduleDocument.start_date = new Date(
          new ZonedDateTime_default(
            startYear,
            startMonth,
            startDay,
            0,
            0,
            timeZone
          ).getUTCString()
        );
        scheduleDocument.end_date = new Date(
          new ZonedDateTime_default(
            endYear,
            endMonth,
            endDay,
            23,
            59,
            timeZone
          ).getUTCString()
        );
        scheduleDocument.next_schedule_time = new Date(
          new ZonedDateTime_default(
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
        yield this.insertProcessedScheduleInDatabase(scheduleDocument);
      } catch (err) {
        console.log(err);
      } finally {
        if (schedule.ReceiptHandle) {
          yield this.queue.deleteMessage(schedule.ReceiptHandle);
        }
      }
    });
  }
  insertProcessedScheduleInDatabase(schedule) {
    return __async(this, null, function* () {
      try {
        let data = yield this.database.insert(schedule);
        return data;
      } catch (err) {
        console.log(err);
      }
    });
  }
  removeProcessedScheduleFromQueue(ReceiptHandle) {
    return __async(this, null, function* () {
      try {
        this.queue.deleteMessage(ReceiptHandle);
      } catch (error) {
        console.log(error);
      }
    });
  }
};

// src/services/schedulerService/SchedulerService.ts
import { v4 as uuidV4 } from "uuid";
var SchedulerService = class {
  constructor(queue, database) {
    this.queue = queue;
    this.database = database;
  }
  createSchedule(schedule) {
    return __async(this, null, function* () {
      try {
        schedule.id = uuidV4();
        schedule.metadata = {
          created_by: "",
          status: "scheduled",
          created_at: /* @__PURE__ */ new Date(),
          updated_at: /* @__PURE__ */ new Date()
        };
        yield this.queue.enqueueMessage(JSON.stringify(schedule));
      } catch (error) {
        console.log(error);
      }
    });
  }
  deleteSchedule(scheduleId) {
    return __async(this, null, function* () {
      try {
        const query = { id: scheduleId };
        yield this.database.delete(query);
      } catch (error) {
        console.log(error);
      }
    });
  }
  updateSchedule(scheduleId, updates) {
    return __async(this, null, function* () {
      try {
        const query = { id: scheduleId };
        yield this.database.update(query, updates);
      } catch (error) {
        console.log(error);
      }
    });
  }
  getSchedule(scheduleId) {
    return __async(this, null, function* () {
      try {
        const query = { id: scheduleId };
        yield this.database.get(query);
      } catch (error) {
        console.log(error);
      }
    });
  }
};

// src/services/pollingWorker/PollingWorker.ts
import { DateTime as DateTime3 } from "luxon";
var PollingWorker = class {
  constructor(queue, database) {
    this.queue = queue;
    this.database = database;
  }
  startWorker() {
    return __async(this, null, function* () {
      yield this.database.connect();
      setInterval(() => __async(this, null, function* () {
        let schedules = yield this.getSchedulesDueInNextInterval();
        if (!schedules)
          return;
        for (let i = 0; i < schedules.length; i++) {
          yield this.queue.enqueueMessage(JSON.stringify(schedules[i]));
          if (schedules[i] && schedules[i].next_schedule_time && schedules[i].repeat_interval !== void 0) {
            schedules[i].next_schedule_time = new Date(
              generateUtcTimestampWithOffset(
                new Date(schedules[i].next_schedule_time).toISOString(),
                calcMillisecsRepeatIntv(
                  schedules[i].repeat_interval.unit,
                  schedules[i].repeat_interval.number
                )
              )
            );
          }
          yield this.updateNextSchedule(schedules[i]._id, schedules[i]);
        }
      }), 60 * 1e3);
    });
  }
  getSchedulesDueInNextInterval() {
    return __async(this, null, function* () {
      try {
        const currentTime = DateTime3.utc();
        const fiveMinutesLater = currentTime.plus({ minutes: 5 });
        const query = {
          start_date: { $lte: currentTime.toJSDate() },
          end_date: { $gte: currentTime.toJSDate() },
          next_schedule_time: {
            $gte: currentTime.toJSDate(),
            $lte: fiveMinutesLater.toJSDate()
          }
        };
        const result = yield this.database.get(query);
        return result;
      } catch (error) {
        console.log(error);
      }
    });
  }
  updateNextSchedule(id, schedule) {
    return __async(this, null, function* () {
      try {
        const query = { _id: id };
        const updates = { next_schedule_time: schedule.next_schedule_time };
        this.database.update(query, updates);
      } catch (error) {
        console.log(error);
      }
    });
  }
};

// src/callbackRegistry/CallbackRegistry.ts
var CallbackRegistry = class _CallbackRegistry {
  constructor() {
    this.callbacks = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!_CallbackRegistry.instance) {
      _CallbackRegistry.instance = new _CallbackRegistry();
    }
    return _CallbackRegistry.instance;
  }
  registerCallback(name, callback) {
    this.callbacks.set(name, callback);
  }
  getCallback(name) {
    return this.callbacks.get(name);
  }
};

// src/services/taskExecutionWorker/TaskExecutorWorker.ts
import { DateTime as DateTime4, Interval as Interval2 } from "luxon";
var TaskExecutorWorker = class {
  constructor(queue) {
    this.queue = queue;
    this.callbackRegistry = CallbackRegistry.getInstance();
  }
  startExecutorWorker() {
    setInterval(() => __async(this, null, function* () {
      const tasks = yield this.pickTaskFromQueue();
      if (tasks && tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          yield this.executeTask(tasks[i]);
          yield this.queue.deleteMessage(tasks[i].ReceiptHandle);
        }
      }
    }), 60 * 1e3);
  }
  pickTaskFromQueue() {
    return __async(this, null, function* () {
      const executables = yield this.queue.pollMessages();
      return executables;
    });
  }
  executeTask(task) {
    return __async(this, null, function* () {
      let messageBody = task.Body ? JSON.parse(task.Body) : void 0;
      if (messageBody) {
        if (messageBody.type == "callback") {
          let args = messageBody.payload.callbackArguments;
          if (messageBody.payload.callbackName && args) {
            const callback = this.callbackRegistry.getCallback(
              messageBody.payload.callbackName
            );
            const interval = Interval2.fromDateTimes(
              DateTime4.utc(),
              // @ts-ignore
              DateTime4.fromISO(messageBody.next_schedule_time, { zone: "utc" })
            );
            const timeout = interval.length("milliseconds");
            callback && setTimeout(() => {
              callback(...args);
              console.log(/* @__PURE__ */ new Date());
            }, timeout);
          }
        } else if (messageBody.type == "API") {
          console.log("API call");
        }
      }
    });
  }
};
export {
  CallbackRegistry,
  MongoDB,
  MySQL,
  PollingWorker,
  ProcessorWorker,
  Queue,
  SchedulerService,
  TaskExecutorWorker
};
