import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./App.css";

type Status = "todo" | "in-progress" | "testing" | "done";
type Priority = "P0" | "P1" | "P2" | "P3";

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

const STATUSES: Status[] = ["todo", "in-progress", "testing", "done"];
const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const statusLabels: Record<Status, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  testing: "Testing",
  done: "Done",
};

const priorityStyles: Record<Priority, string> = {
  P0: "bg-red-500/20 text-red-200",
  P1: "bg-orange-500/20 text-orange-200",
  P2: "bg-sky-500/20 text-sky-200",
  P3: "bg-slate-500/20 text-slate-200",
};

const statusBadge: Record<Status, string> = {
  "todo": "bg-slate-800 text-slate-200",
  "in-progress": "bg-indigo-500/20 text-indigo-200",
  testing: "bg-amber-500/20 text-amber-200",
  done: "bg-emerald-500/20 text-emerald-200",
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<Status, Task[]>);
  }, [tasks]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: grouped.todo?.length ?? 0,
      inProgress: grouped["in-progress"]?.length ?? 0,
      testing: grouped.testing?.length ?? 0,
      done: grouped.done?.length ?? 0,
    };
  }, [tasks, grouped]);

  async function fetchTasks() {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }

  async function createTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });

    if (res.ok) {
      setTitle("");
      setPriority("P2");
      await fetchTasks();
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    await fetchTasks();
  }

  async function runNow() {
    await fetch("http://localhost:5000/api/tasks/run", { method: "POST" });
    await fetchTasks();
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f1c] text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />

      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-4 pt-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-xl font-bold shadow-lg shadow-indigo-500/30">
            OC
          </div>
          <div>
            <p className="text-sm text-slate-400">OpenClaw TaskFlow</p>
            <h1 className="text-2xl font-semibold">AI Task Board</h1>
            <p className="text-sm text-slate-400">Prioritize, track, and auto-run work every 5 minutes.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchTasks}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Refresh
          </button>
          <button
            onClick={runNow}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
          >
            Run Now
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, tone: "bg-slate-900/70" },
          { label: "To Do", value: stats.todo, tone: "bg-slate-900/70" },
          { label: "In Progress", value: stats.inProgress, tone: "bg-indigo-500/10" },
          { label: "Done", value: stats.done, tone: "bg-emerald-500/10" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border border-slate-800 ${item.tone} p-4`}>
            <p className="text-xs uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create task</h2>
            <span className={`rounded-full px-3 py-1 text-xs ${statusBadge.todo}`}>To Do</span>
          </div>
          <form onSubmit={createTask} className="mt-4 space-y-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Describe the task..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm"
              >
                {PRIORITIES.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500"
              >
                Add Task
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-sm text-slate-400">
                No tasks yet. Add one to get started.
              </div>
            ) : (
              tasks
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold">{task.title}</p>
                        <p className="text-xs text-slate-400">
                          Updated {new Date(task.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-1 ${statusBadge[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                      {task.lastRunAt && (
                        <span className="text-slate-500">
                          Last run {new Date(task.lastRunAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateTask(task.id, { status })}
                          className={`rounded-full border px-2 py-1 ${
                            task.status === status
                              ? "border-indigo-500 text-indigo-200"
                              : "border-slate-800 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{statusLabels[status]}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${statusBadge[status]}`}>
                  {grouped[status]?.length ?? 0}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {(grouped[status] ?? []).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span className={`rounded-full px-2 py-0.5 ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span>Updated {new Date(task.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                {(grouped[status] ?? []).length === 0 && (
                  <p className="text-xs text-slate-500">No tasks here.</p>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8 text-xs text-slate-500">
        Auto-run advances the highest priority task every 5 minutes.
        {loading && " Refreshing..."}
      </footer>
    </div>
  );
}

export default App;
