import { Database } from "../src/databse/Database.js";

const database = new Database({
    server: "localhost",
    port: 1434,
    database: "Orm",
    user: "sa",
    password: "GodIsGood@1234"
});

await database.connect();