declare module "promised-sqlite3" {
  export class AsyncDatabase {
    static open(filename: string): Promise<AsyncDatabase>;
    all<T = Record<string, unknown>>(
      sql: string,
      params?: unknown[],
    ): Promise<T[]>;
    get<T = Record<string, unknown>>(
      sql: string,
      params?: unknown[],
    ): Promise<T | undefined>;
    run(
      sql: string,
      params?: unknown[],
    ): Promise<{ lastID: number; changes: number }>;
  }
}
