export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  insert(record: any, collection?: string): Promise<void>;
  delete(query: any, collection?: string): Promise<void>;
  update(query: any, updates: any, collection?: string): Promise<void>;
  get(query: any, collection?: string): Promise<any[]>;
}
