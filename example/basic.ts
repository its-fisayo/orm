import { Database } from "../src/databse/Database.js";
import type { ConnectionConfig } from "../src/databse/ConnectionConfig.js";

const config: ConnectionConfig = {
    server: "localhost",
    port: 1434,
    database: "Orm",
    user: "sa",
    password: "GodIsGood@1234"
};

const db = new Database(config);
await db.connect();

const users = await db.query(`
    SELECT TOP 10 * FROM Orders`);
console.log(users);