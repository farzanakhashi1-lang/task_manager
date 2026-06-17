import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, "data", "tasks.json");
const frontendBuild = path.join(__dirname, "..", "frontend", "dist");

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const allowedPriorities = ["Low", "Medium", "High"];
const allowedStatuses = ["Todo", "In Progress", "Done"];

app.use(cors());
app.use(express.json());

async function readTasks() {
  const content = await fs.readFile(dataFile, "utf8");
  return JSON.parse(content);
}

async function writeTasks(tasks) {
  await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2));
}

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
  res.json({ status: "ok", project: "Task Manager" });
});

app.get("/api/tasks", async (req, res, next) => {
  try {
    const { search = "", status = "All", priority = "All" } = req.query;
    const searchText = String(search).trim().toLowerCase();
    const tasks = await readTasks();

    const filteredTasks = tasks.filter((task) => {
      const matchesSearch =
        !searchText ||
        task.title.toLowerCase().includes(searchText) ||
        task.description.toLowerCase().includes(searchText);
      const matchesStatus = status === "All" || task.status === status;
      const matchesPriority = priority === "All" || task.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    res.json(filteredTasks);
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
    const tasks = await readTasks();
    tasks.unshift(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
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

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ errors: ["Task was not found."] });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...taskInput,
      updatedAt: new Date().toISOString()
    };
    tasks[taskIndex] = updatedTask;
    await writeTasks(tasks);

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const remainingTasks = tasks.filter((task) => task.id !== req.params.id);

    if (remainingTasks.length === tasks.length) {
      return res.status(404).json({ errors: ["Task was not found."] });
    }

    await writeTasks(remainingTasks);
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

app.listen(PORT, HOST, () => {
  console.log(`Task Manager API is running on http://${HOST}:${PORT}`);
});
