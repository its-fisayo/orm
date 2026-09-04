import sql from "mssql";
import type { ConnectionConfig } from "./ConnectionConfig.js";

export class Database {
  private pool: sql.ConnectionPool | null = null;

  constructor(private config: ConnectionConfig) {}

  async connect(): Promise<void> {
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

    const result = await this.pool.request().query(`
  SELECT TOP 10 *
  FROM Users
`);

    console.log(result.recordset);
  }
}
