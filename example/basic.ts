import { Database } from "../src/database/Database.js";
import type { ConnectionConfig } from "../src/database/ConnectionConfig.js";

const config: ConnectionConfig = {
  server: "localhost",
  port: 1434,
  database: "Orm",
  user: "sa",
  password: "GodIsGood@1234",
};

const db = new Database(config);
await db.connect();

const users = await db.table("Users").select("id").get();
// const orders = await db.table("Orders").where("total", ">", 15).where("userid", "=", 1).get();
// const orders = await db
//   .table("Orders")
//   .where("id", 1)
//   .select("id")
//   .whereIn("total", [15, 26])
//   .orderBy("total", "ASC")
//   .limit(5)
//   .get();
// const user = await db.table("Users").create({
//     Name: "Esther",
//     Email: "esther@wemabank.com"
// });
// const updateOrders = await db.table("Orders").where("id", 1).update({Total: 26});
// db.table("Orders").where("id", 5).delete();
// const count = await db.table("Orders").count();

// console.log("Total orders:", count);

console.log(users);
// console.log(orders);
// console.log(user);
// console.log(updateOrders);
// console.log("Order deleted");

// await db.schema().createTable("Workers", 
//     `
//     ID INT IDENTITY(1,1) PRIMARY KEY,
//     Name NVARCHAR(100) NOT NULL,
//     Email NVARCHAR(255) NOT NULL`
// );
// await db.schema().dropTable("Workers");

// console.log("Workers table dropped");
// console.log("Workers table created");

// const workers = await db.table("Workers").get();

// console.log(workers);