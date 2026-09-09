import sql from "mssql";
import type { ConnectionConfig } from "./ConnectionConfig.js";
import { QueryBuilder } from "./QueryBuilder.js";
import { SchemaBuilder } from "./SchemaBuilder.js";

export class Database {
  private pool: sql.ConnectionPool | null = null;

  constructor(private config: ConnectionConfig) {}

  async connect(): Promise<void> {
    try {
      this.pool = await sql.connect({
        server: this.config.server,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,

        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      });

      console.log("Connected to SQL Server");
    } catch (err) {
      const error = err as Error;
      console.log({ dbConnectionError: error });
      throw new Error(`Unable to connect to db: ${error.message}`);
    }
  }

  async query<T = unknown>(
    query: string,
    params?: Record<string, unknown>,
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error("Database is not connected");
    }

    const request = this.pool.request();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
    }

    const result = await request.query(query);

    return result.recordset;
  }

  async getTableName(tableName: string): Promise<string[]> {
    const result = await this.query<{COLUMN_NAME: string}> (
      `SELECT COLUMN_NAME
      FROM INFORMATION_sCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION`,
      {tableName}
    );

    return result.map(column => column.COLUMN_NAME);
  }

  table(tableName: string): QueryBuilder {
    return new QueryBuilder(this, tableName);
  }

  schema(): SchemaBuilder {
    return new SchemaBuilder(this);
  }
}
