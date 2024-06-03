import { SendMessageCommandOutput, Message, DeleteMessageCommandOutput, GetQueueAttributesCommandOutput } from '@aws-sdk/client-sqs';
import { ObjectId } from 'mongodb';

interface IDatabase {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    insert(record: any, collection?: string): Promise<void>;
    delete(query: any, collection?: string): Promise<void>;
    update(query: any, updates: any, collection?: string): Promise<void>;
    get(query: any, collection?: string): Promise<any[]>;
}

declare class MongoDB implements IDatabase {
    private client;
    private db;
    private dbName;
    private collectionName;
    constructor(uri: string, dbName: string, collectionName: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    insert(record: any, collection?: string): Promise<void>;
    delete(query: any, collection?: string): Promise<void>;
    update(query: any, updates: any, collection?: string): Promise<void>;
    get(query: any, collection?: string): Promise<any[]>;
}

declare class MySQL implements IDatabase {
    private config;
    private connection;
    constructor(config: {
        host: string;
        user: string;
        password: string;
        database: string;
    });
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    insert(record: any): Promise<void>;
    delete(query: any): Promise<void>;
    update(query: any, updates: any): Promise<void>;
    get(query: any): Promise<any[]>;
}

interface IQueue<TSendMessageOutput, TReceiveMessageResult, TDeleteMessageOutput, TQueueAttributesOutput> {
    enqueueMessage(message: any): Promise<TSendMessageOutput>;
    pollMessages(): Promise<TReceiveMessageResult>;
    deleteMessage(receiptHandle: string): Promise<TDeleteMessageOutput>;
    queueAttributes(): Promise<TQueueAttributesOutput>;
}

declare class Queue implements IQueue<SendMessageCommandOutput, Message[] | undefined, DeleteMessageCommandOutput, GetQueueAttributesCommandOutput> {
    private queueURI;
    private client;
    constructor(queueURI: string, region: string, credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    });
    enqueueMessage(message: any): Promise<SendMessageCommandOutput>;
    deleteMessage(receiptHandle: string): Promise<DeleteMessageCommandOutput>;
    pollMessages(): Promise<Message[] | undefined>;
    queueAttributes(): Promise<GetQueueAttributesCommandOutput>;
}

interface IProcessorWorker<T, T1, T2, T3> {
    startWorker(): void;
    processSchedule(schedule: T): Promise<T1>;
    insertProcessedScheduleInDatabase(schedule: any): Promise<T2>;
    fetchSchedulesFromQueueForProcessing(): Promise<T3>;
    removeProcessedScheduleFromQueue(ReceiptHandle: string): Promise<void>;
}

declare class ProcessorWorker implements IProcessorWorker<Message, void, void, Message[] | undefined> {
    private queue;
    private database;
    constructor(queue: Queue, database: IDatabase);
    startWorker(): Promise<void>;
    fetchSchedulesFromQueueForProcessing(): Promise<Message[] | undefined>;
    processSchedule(schedule: Message): Promise<any>;
    insertProcessedScheduleInDatabase(schedule: any): Promise<void>;
    removeProcessedScheduleFromQueue(ReceiptHandle: string): Promise<void>;
}

interface QueryParameters {
    [key: string]: string;
}
interface Body {
    [key: string]: any;
}
interface DB_Updates {
    [key: string]: any;
}
type schedule = {
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
type repeatIntervalUnitType = "minute" | "hour" | "day" | "month" | "year";
type Callback = (...args: any[]) => any;

interface ISchedulerService {
    createSchedule(schedule: schedule): Promise<void>;
    deleteSchedule(scheduleId: string): Promise<void>;
    updateSchedule(scheduleId: string, updates: DB_Updates): Promise<void>;
    getSchedule(scheduleId: string): Promise<void>;
}

declare class SchedulerService implements ISchedulerService {
    private queue;
    private database;
    constructor(queue: Queue, database: IDatabase);
    createSchedule(schedule: schedule): Promise<void>;
    deleteSchedule(scheduleId: string): Promise<void>;
    updateSchedule(scheduleId: string, updates: DB_Updates): Promise<void>;
    getSchedule(scheduleId: string): Promise<void>;
}

interface IPollingWorker<T1, T2, T3> {
    getSchedulesDueInNextInterval(): Promise<T1>;
    updateNextSchedule(id: T3, schedule: schedule): Promise<T2>;
}

declare class PollingWorker implements IPollingWorker<schedule[] | undefined, void, ObjectId> {
    private queue;
    private database;
    constructor(queue: Queue, database: MongoDB);
    startWorker(): Promise<void>;
    getSchedulesDueInNextInterval(): Promise<schedule[] | undefined>;
    updateNextSchedule(id: ObjectId, schedule: schedule): Promise<void>;
}

interface ITaskExecutionWorker<T1, T2> {
    pickTaskFromQueue(): T1;
    executeTask(task: T2): Promise<void>;
}

declare class TaskExecutorWorker implements ITaskExecutionWorker<Promise<Message[] | undefined>, Message> {
    private queue;
    private callbackRegistry;
    constructor(queue: Queue);
    startExecutorWorker(): void;
    pickTaskFromQueue(): Promise<Message[] | undefined>;
    executeTask(task: Message): Promise<void>;
}

interface ICallbackRegistry<T1> {
    registerCallback(name: string, callback: T1): void;
    getCallback(name: string): T1 | undefined;
}

declare class CallbackRegistry implements ICallbackRegistry<Callback> {
    private static instance;
    private callbacks;
    private constructor();
    static getInstance(): CallbackRegistry;
    registerCallback(name: string, callback: Callback): void;
    getCallback(name: string): Callback | undefined;
}

export { type Body, type Callback, CallbackRegistry, type DB_Updates, MongoDB, MySQL, PollingWorker, ProcessorWorker, type QueryParameters, Queue, SchedulerService, TaskExecutorWorker, type repeatIntervalUnitType, type schedule };
