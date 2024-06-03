import { createConnection, Connection } from "mysql2/promise";
import { IDatabase } from "../interfaces/IDatabase";

export class MySQL implements IDatabase {
  // @ts-ignore
  private connection: Connection;

  constructor(
    private config: {
      host: string;
      user: string;
      password: string;
      database: string;
    }
  ) {}

  async connect(): Promise<void> {
    this.connection = await createConnection(this.config);
  }

  async disconnect(): Promise<void> {
    await this.connection.end();
  }

  async insert(record: any): Promise<void> {
    const keys = Object.keys(record).join(", ");
    const values = Object.values(record)
      .map(() => "?")
      .join(", ");
    await this.connection.execute(
      `INSERT INTO yourTable (${keys}) VALUES (${values})`,
      Object.values(record)
    );
  }

  async delete(query: any): Promise<void> {
    const [key, value] = Object.entries(query)[0];
    await this.connection.execute(`DELETE FROM yourTable WHERE ${key} = ?`, [
      value,
    ]);
  }

  async update(query: any, updates: any): Promise<void> {
    const [key, value] = Object.entries(query)[0];
    const setClause = Object.keys(updates)
      .map((k) => `${k} = ?`)
      .join(", ");
    await this.connection.execute(
      `UPDATE yourTable SET ${setClause} WHERE ${key} = ?`,
      [...Object.values(updates), value]
    );
  }

  async get(query: any): Promise<any[]> {
    const [key, value] = Object.entries(query)[0];
    const [rows] = await this.connection.execute(
      `SELECT * FROM yourTable WHERE ${key} = ?`,
      [value]
    );
    return rows as any[];
  }
}
