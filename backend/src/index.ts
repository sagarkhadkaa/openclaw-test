import express from "express";
import cors from "cors";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5000;

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

const STATUSES = ["todo", "in-progress", "testing", "done"] as const;
const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;

type Status = (typeof STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];

type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  logs: string[];
};

const priorityRank: Record<Priority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, JSON.stringify([], null, 2));
  }
}

async function loadTasks(): Promise<Task[]> {
  await ensureDataFile();
  const raw = await fs.readFile(TASKS_FILE, "utf8");
  return JSON.parse(raw) as Task[];
}

async function saveTasks(tasks: Task[]) {
  await ensureDataFile();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function nextStatus(status: Status): Status | null {
  const index = STATUSES.indexOf(status);
  if (index === -1 || index === STATUSES.length - 1) return null;
  return STATUSES[index + 1];
}

async function runTaskCycle() {
  const tasks = await loadTasks();
  const candidates = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt.localeCompare(b.createdAt);
    });

  if (candidates.length === 0) return null;

  const task = candidates[0];
  const updatedAt = new Date().toISOString();
  const next = nextStatus(task.status);
  if (!next) return null;

  task.status = next;
  task.updatedAt = updatedAt;
  task.lastRunAt = updatedAt;
  task.logs.push(`Auto-run advanced to ${next} @ ${updatedAt}`);

  await saveTasks(tasks);
  return task;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/tasks", async (_req, res) => {
  const tasks = await loadTasks();
  res.json({ tasks });
});

app.post("/api/tasks", async (req, res) => {
  const { title, priority } = req.body as { title?: string; priority?: Priority };

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }

  const normalizedPriority = PRIORITIES.includes(priority as Priority) ? priority : "P2";
  const now = new Date().toISOString();

  const task: Task = {
    id: crypto.randomUUID(),
    title,
    priority: normalizedPriority as Priority,
    status: "todo",
    createdAt: now,
    updatedAt: now,
    logs: ["Created"],
  };

  const tasks = await loadTasks();
  tasks.push(task);
  await saveTasks(tasks);

  res.status(201).json({ task });
});

app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, priority, status } = req.body as {
    title?: string;
    priority?: Priority;
    status?: Status;
  };

  const tasks = await loadTasks();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  if (title && typeof title === "string") task.title = title;
  if (priority && PRIORITIES.includes(priority)) task.priority = priority;
  if (status && STATUSES.includes(status)) task.status = status;

  task.updatedAt = new Date().toISOString();
  task.logs.push(`Manual update @ ${task.updatedAt}`);

  await saveTasks(tasks);
  res.json({ task });
});

app.post("/api/tasks/run", async (_req, res) => {
  const task = await runTaskCycle();
  res.json({ task });
});

setInterval(() => {
  runTaskCycle().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Task runner failed:", error);
  });
}, 2 * 60 * 1000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
