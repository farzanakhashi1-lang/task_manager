import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTask, deleteTask, getDatabaseType, getTasks, initializeDatabase, updateTask } from "./database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuild = path.join(__dirname, "..", "frontend", "dist");

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const allowedPriorities = ["Low", "Medium", "High"];
const allowedStatuses = ["Todo", "In Progress", "Done"];

app.use(cors());
app.use(express.json());

function normalizeTaskInput(body) {
  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    priority: body.priority || "Medium",
    status: body.status || "Todo",
    dueDate: body.dueDate || ""
  };
}

function validateTask(task) {
  const errors = [];

  if (!task.title) errors.push("Title is required.");
  if (task.title.length > 80) errors.push("Title must be 80 characters or less.");
  if (task.description.length > 500) errors.push("Description must be 500 characters or less.");
  if (!allowedPriorities.includes(task.priority)) errors.push("Priority is invalid.");
  if (!allowedStatuses.includes(task.status)) errors.push("Status is invalid.");
  if (task.dueDate && Number.isNaN(Date.parse(task.dueDate))) errors.push("Due date is invalid.");

  return errors;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", project: "Task Manager", database: getDatabaseType() });
});

app.get("/api/tasks", async (req, res, next) => {
  try {
    const { search = "", status = "All", priority = "All" } = req.query;
    const tasks = await getTasks({ search, status, priority });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const taskInput = normalizeTaskInput(req.body);
    const errors = validateTask(taskInput);

    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const now = new Date().toISOString();
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskInput,
      createdAt: now,
      updatedAt: now
    };
    res.status(201).json(await createTask(newTask));
  } catch (error) {
    next(error);
  }
});

app.put("/api/tasks/:id", async (req, res, next) => {
  try {
    const taskInput = normalizeTaskInput(req.body);
    const errors = validateTask(taskInput);

    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const updatedTask = await updateTask(req.params.id, taskInput);

    if (!updatedTask) {
      return res.status(404).json({ errors: ["Task was not found."] });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    if (!(await deleteTask(req.params.id))) {
      return res.status(404).json({ errors: ["Task was not found."] });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use(express.static(frontendBuild));

app.get("*", async (_req, res, next) => {
  try {
    await fs.access(path.join(frontendBuild, "index.html"));
    res.sendFile(path.join(frontendBuild, "index.html"));
  } catch (error) {
    next();
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ errors: ["Server error. Please try again."] });
});

try {
  await initializeDatabase();

  app.listen(PORT, HOST, () => {
    console.log(`Task Manager API is running on http://${HOST}:${PORT}`);
  });
} catch (error) {
  console.error("Failed to start Task Manager API:", error);
  process.exit(1);
}
