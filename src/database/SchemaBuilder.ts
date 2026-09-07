import { Database } from "./Database.js";

export class SchemaBuilder {
    constructor(private db: Database) {}

    async createTable(tableName: string, definition: string): Promise<void> {
        const query = `CREATE TABLE ${tableName} (
        ${definition})`;

        await this.db.query(query)
    }

    async dropTable(tableName: string): Promise<void> {
        const query = `DROP TABLE ${tableName}`;

        await this.db.query(query);
    }
}