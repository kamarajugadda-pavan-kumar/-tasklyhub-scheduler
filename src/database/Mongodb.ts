import { MongoClient, Db } from "mongodb";
import { IDatabase } from "../interfaces/IDatabase";

export class MongoDB implements IDatabase {
  private client: MongoClient;
  //@ts-ignore
  private db: Db;
  private dbName: string;
  private collectionName: string;

  constructor(uri: string, dbName: string, collectionName: string) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async insert(record: any, collection?: string): Promise<void> {
    if (!collection) {
      collection = this.collectionName;
    }
    await this.db.collection(collection).insertOne(record);
  }

  async delete(query: any, collection?: string): Promise<void> {
    if (!collection) {
      collection = this.collectionName;
    }
    await this.db.collection(collection).deleteOne(query);
  }

  async update(query: any, updates: any, collection?: string): Promise<void> {
    if (!collection) {
      collection = this.collectionName;
    }
    await this.db.collection(collection).updateOne(query, { $set: updates });
  }

  async get(query: any, collection?: string): Promise<any[]> {
    if (!collection) {
      collection = this.collectionName;
    }
    return await this.db.collection(collection).find(query).toArray();
  }
}
