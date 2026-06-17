import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const databaseFile = process.env.DATABASE_FILE || path.join(dataDirectory, "task_manager.sqlite");
const seedFile = path.join(dataDirectory, "tasks.json");

let store;

function loadSeedTasks() {
  if (!fs.existsSync(seedFile)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(seedFile, "utf8"));
}

function removeMongoId(task) {
  if (!task) {
    return null;
  }

  const { _id, ...cleanTask } = task;
  return cleanTask;
}

function createSqliteStore() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  const db = new DatabaseSync(databaseFile);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      dueDate TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;

  if (taskCount === 0) {
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, priority, status, dueDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const task of loadSeedTasks()) {
      insertTask.run(
        task.id,
        task.title,
        task.description || "",
        task.priority,
        task.status,
        task.dueDate || "",
        task.createdAt,
        task.updatedAt
      );
    }
  }

  return {
    type: "SQLite",

    async getTasks({ search = "", status = "All", priority = "All" } = {}) {
      const conditions = [];
      const params = [];
      const searchText = String(search).trim().toLowerCase();

      if (searchText) {
        conditions.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)");
        params.push(`%${searchText}%`, `%${searchText}%`);
      }

      if (status !== "All") {
        conditions.push("status = ?");
        params.push(status);
      }

      if (priority !== "All") {
        conditions.push("priority = ?");
        params.push(priority);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

      return db.prepare(`SELECT * FROM tasks ${whereClause} ORDER BY createdAt DESC`).all(...params);
    },

    async createTask(task) {
      db.prepare(`
        INSERT INTO tasks (id, title, description, priority, status, dueDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        task.id,
        task.title,
        task.description,
        task.priority,
        task.status,
        task.dueDate,
        task.createdAt,
        task.updatedAt
      );

      return task;
    },

    async updateTask(id, taskInput) {
      const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

      if (!existingTask) {
        return null;
      }

      const updatedTask = {
        ...existingTask,
        ...taskInput,
        updatedAt: new Date().toISOString()
      };

      db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, priority = ?, status = ?, dueDate = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        updatedTask.title,
        updatedTask.description,
        updatedTask.priority,
        updatedTask.status,
        updatedTask.dueDate,
        updatedTask.updatedAt,
        id
      );

      return updatedTask;
    },

    async deleteTask(id) {
      const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
      return result.changes > 0;
    }
  };
}

async function createMongoStore() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const databaseName = process.env.MONGODB_DB_NAME || "task_manager";
  const db = client.db(databaseName);
  const tasks = db.collection("tasks");
  await tasks.createIndex({ id: 1 }, { unique: true });

  if ((await tasks.countDocuments()) === 0) {
    const seedTasks = loadSeedTasks();

    if (seedTasks.length > 0) {
      await tasks.insertMany(seedTasks);
    }
  }

  return {
    type: "MongoDB",

    async getTasks({ search = "", status = "All", priority = "All" } = {}) {
      const query = {};
      const searchText = String(search).trim();

      if (searchText) {
        query.$or = [
          { title: { $regex: searchText, $options: "i" } },
          { description: { $regex: searchText, $options: "i" } }
        ];
      }

      if (status !== "All") {
        query.status = status;
      }

      if (priority !== "All") {
        query.priority = priority;
      }

      const taskList = await tasks.find(query).sort({ createdAt: -1 }).toArray();
      return taskList.map(removeMongoId);
    },

    async createTask(task) {
      await tasks.insertOne(task);
      return task;
    },

    async updateTask(id, taskInput) {
      const updatedTask = {
        ...taskInput,
        updatedAt: new Date().toISOString()
      };
      const result = await tasks.findOneAndUpdate(
        { id },
        { $set: updatedTask },
        { returnDocument: "after" }
      );

      return removeMongoId(result);
    },

    async deleteTask(id) {
      const result = await tasks.deleteOne({ id });
      return result.deletedCount > 0;
    }
  };
}

export async function initializeDatabase() {
  store = process.env.MONGODB_URI ? await createMongoStore() : createSqliteStore();
  console.log(`Task Manager is using ${store.type} storage.`);
}

function getStore() {
  if (!store) {
    throw new Error("Database has not been initialized.");
  }

  return store;
}

export function getDatabaseType() {
  return getStore().type;
}

export function getTasks(filters) {
  return getStore().getTasks(filters);
}

export function createTask(task) {
  return getStore().createTask(task);
}

export function updateTask(id, taskInput) {
  return getStore().updateTask(id, taskInput);
}

export function deleteTask(id) {
  return getStore().deleteTask(id);
}
