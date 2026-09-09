import { Database } from "./Database.js";

export class QueryBuilder {
  private conditions: string[] = [];
  private parameters: Record<string, unknown> = {};
  private orderByClause: string | null = null;
  private limitValue: number | null = null;
  private selectedColumns: string[] = [];

  private addParameter(value: unknown): string {
    const parameterName = `param${Object.keys(this.parameters).length}`;

    this.parameters[parameterName] = value;

    return `@${parameterName}`;
  }

  constructor(
    private db: Database,
    private tableName: string,
  ) {}

  where(
    column: string,
    operatorOrValue: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | unknown,
    value?: unknown,
  ): this {
    let operator: string;
    let actualValue: unknown;

    if (value === undefined) {
      operator = "=";
      actualValue = operatorOrValue;
    } else {
      operator = operatorOrValue as string;
      actualValue = value;
    }
    const parameter = this.addParameter(actualValue);

    this.conditions.push(`${column} ${operator} @${parameter}`);

    return this;
  }

  whereIn(column: string, values: unknown[]): this {
    if (values.length === 0) {
      throw new Error("WhereIn requires at least one value");
    }

    const parameters = values.map((value) => this.addParameter(value));

    this.conditions.push(`${column} IN (${parameters.join(", ")})`);

    return this;
  }

  select(...columns: string[]): this {
    if (columns.length === 0) {
      throw new Error("Select requires at least one column");
    }

    this.selectedColumns = columns;

    return this;
  }

  orderBy(column: string, direction: "ASC" | "DESC" = "ASC") {
    this.orderByClause = `${column} ${direction}`;

    return this;
  }

  limit(count: number): this {
    if (count <= 0) {
      throw new Error("Limit must be greater than 0");
    }

    this.limitValue = count;

    return this;
  }
  async get<T = any>(): Promise<T[]> {
    let query = `SELECT`;
    let columns: string[];

    if(this.selectedColumns.length > 0) {
      columns = this.selectedColumns
    } else {
      columns = await this.db.getTableName(this.tableName);
    }

    if (this.limitValue !== null) {
      query += ` TOP ${this.limitValue}`;
    }

    query += ` ${columns.join(", ")} FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(" AND ")}`;
    }

    if (this.orderByClause) {
      query += ` ORDER BY ${this.orderByClause}`;
    }
console.log("Generated SQL:", query);
console.log("Parameters:", this.parameters);
    return this.db.query<T>(query, this.parameters);
  }

  async first<T = any>(): Promise<T | null> {
    this.limitValue = 1;

    const results = await this.get<T>();

    return results.length > 0 ? results[0]! : null;
  }

  async create<T = any>(data: Record<string, unknown>): Promise<T> {
    const columns = Object.keys(data);

    if (columns.length === 0) {
      throw new Error("Cannot create a record with no data");
    }

    const parameterNames = columns.map((_, index) => `param${index}`);

    const query = `INSERT INTO ${this.tableName}
    (${columns.join(", ")})
    OUTPUT INSERTED.*
    VALUES (${parameterNames.map((name) => `@${name}`).join(", ")})
    `;

    const params: Record<string, unknown> = {};

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]!;

      params[`param${i}`] = data[column];
    }

    const results = await this.db.query<T>(query, params);

    if (results.length === 0) {
      throw new Error("Failed to create record");
    }

    return results[0]!;
  }

  async update<T = any>(data: Record<string, unknown>): Promise<T[]> {
    const columns = Object.keys(data);

    if (columns.length === 0) {
      throw new Error("Cannot update a record with no data");
    }

    if (this.conditions.length === 0) {
      throw new Error("Update requires a WHERE condition");
    }

    const setClauses: string[] = [];
    const updateParams: Record<string, unknown> = {};

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]!;
      const parameterName = `updateParam${i}`;

      setClauses.push(`${column} = @${parameterName}`);

      updateParams[parameterName] = data[column];
    }

    const query = `UPDATE ${this.tableName}
    SET ${setClauses.join(", ")}
    WHERE ${this.conditions.join(" AND ")}
    `;

    const params = { ...this.parameters, ...updateParams };

    await this.db.query(query, params);

    return this.get<T>();
  }

  async delete(): Promise<void> {
    if (this.conditions.length === 0) {
      throw new Error("Delete requires a WHERE condition");
    }

    const query = `DELETE FROM ${this.tableName}
    WHERE ${this.conditions.join(" AND ")}`;

    await this.db.query(query, this.parameters);
  }

  async count(): Promise<number> {
    let query = `SELECT COUNT(*) AS count
    FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(" AND ")}`;
    }

    const results = await this.db.query<{ count: number }>(
      query,
      this.parameters,
    );

    return results[0]?.count ?? 0;
  }
}
