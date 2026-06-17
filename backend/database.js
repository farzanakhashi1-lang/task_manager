import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const databaseFile = process.env.DATABASE_FILE || path.join(dataDirectory, "task_manager.sqlite");
const seedFile = path.join(dataDirectory, "tasks.json");

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

if (taskCount === 0 && fs.existsSync(seedFile)) {
  const seedTasks = JSON.parse(fs.readFileSync(seedFile, "utf8"));
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, priority, status, dueDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const task of seedTasks) {
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

export function getTasks({ search = "", status = "All", priority = "All" } = {}) {
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
}

export function createTask(task) {
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
}

export function updateTask(id, taskInput) {
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
}

export function deleteTask(id) {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}
