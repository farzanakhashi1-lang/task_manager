import { MongoClient } from "mongodb";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDirectory = path.join(__dirname, "data");
const databaseFile = process.env.DATABASE_FILE || path.join(dataDirectory, "task_manager.sqlite");

const uri = process.argv[2] || process.env.MONGODB_URI;
const dbName = process.argv[3] || process.env.MONGODB_DB_NAME || "task_manager";

if (!uri) {
  console.error("Usage: node migrateSqliteToMongo.mjs <MONGODB_URI> [DB_NAME]");
  process.exit(1);
}

if (!fs.existsSync(databaseFile)) {
  console.error("SQLite database not found:", databaseFile);
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB Atlas.");

  const db = client.db(dbName);
  const tasksColl = db.collection("tasks");
  await tasksColl.createIndex({ id: 1 }, { unique: true });

  const dbSql = new DatabaseSync(databaseFile);
  const rows = dbSql.prepare("SELECT * FROM tasks ORDER BY createdAt DESC").all();

  if (!rows || rows.length === 0) {
    console.log("No tasks found in SQLite database.");
    await client.close();
    return;
  }

  const operations = rows.map((r) => ({
    updateOne: {
      filter: { id: r.id },
      update: { $set: r },
      upsert: true
    }
  }));

  const result = await tasksColl.bulkWrite(operations, { ordered: false });
  console.log(`Migration complete. Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);

  await client.close();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
