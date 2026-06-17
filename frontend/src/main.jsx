import React from "react";
import ReactDOM from "react-dom/client";
import { CalendarDays, CheckCircle2, Edit3, ListFilter, Plus, Search, Trash2, X } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");
const emptyTask = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Todo",
  dueDate: ""
};

function App() {
  const [tasks, setTasks] = React.useState([]);
  const [form, setForm] = React.useState(emptyTask);
  const [editingId, setEditingId] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All");
  const [priority, setPriority] = React.useState("All");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status, priority });
    const response = await fetch(`${API_URL}/tasks?${params.toString()}`);
    const data = await response.json();
    setTasks(data);
    setLoading(false);
  }, [search, status, priority]);

  React.useEffect(() => {
    loadTasks().catch(() => {
      setMessage("Cannot load tasks. Please check that the backend server is running.");
      setLoading(false);
    });
  }, [loadTasks]);

  const totals = React.useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "Todo").length,
      progress: tasks.filter((task) => task.status === "In Progress").length,
      done: tasks.filter((task) => task.status === "Done").length
    }),
    [tasks]
  );

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function submitTask(event) {
    event.preventDefault();
    setMessage("");

    const endpoint = editingId ? `${API_URL}/tasks/${editingId}` : `${API_URL}/tasks`;
    const response = await fetch(endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const result = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      setMessage(result.errors.join(" "));
      return;
    }

    setForm(emptyTask);
    setEditingId(null);
    setMessage(editingId ? "Task updated successfully." : "Task added successfully.");
    await loadTasks();
  }

  function startEditing(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyTask);
    setMessage("");
  }

  async function deleteTask(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("Task could not be deleted.");
      return;
    }

    setMessage("Task deleted successfully.");
    await loadTasks();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Educational Practice 2025-2026</p>
          <h1>Task Manager</h1>
          <p className="hero-copy">
            A simple web application for adding, viewing, editing, deleting, searching, and filtering study tasks.
          </p>
        </div>
        <div className="stats" aria-label="Task statistics">
          <span><strong>{totals.all}</strong> Total</span>
          <span><strong>{totals.todo}</strong> Todo</span>
          <span><strong>{totals.progress}</strong> Progress</span>
          <span><strong>{totals.done}</strong> Done</span>
        </div>
      </section>

      <section className="workspace">
        <form className="task-form" onSubmit={submitTask}>
          <div className="section-title">
            <Plus size={20} aria-hidden="true" />
            <h2>{editingId ? "Edit Task" : "Add Task"}</h2>
          </div>

          {message && <p className="message">{message}</p>}

          <label>
            Task title
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="Example: Finish report screenshots"
              maxLength="80"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Write the task details"
              maxLength="500"
              rows="5"
            />
          </label>

          <div className="form-grid">
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </label>
          </div>

          <label>
            Due date
            <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
          </label>

          <div className="actions">
            <button type="submit" className="primary-button">
              {editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
              {editingId ? "Save Changes" : "Add Task"}
            </button>
            {editingId && (
              <button type="button" className="ghost-button" onClick={cancelEditing}>
                <X size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="task-list">
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" />
            </div>
            <label className="compact-filter">
              <ListFilter size={17} aria-hidden="true" />
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>All</option>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </label>
            <label className="compact-filter">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="empty-state">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">No tasks found.</p>
          ) : (
            <div className="cards">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="card-top">
                    <div>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <h3>{task.title}</h3>
                    </div>
                    <span className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>
                  </div>

                  <p>{task.description || "No description added."}</p>

                  <div className="card-bottom">
                    <span>
                      <CalendarDays size={16} aria-hidden="true" />
                      {task.dueDate || "No due date"}
                    </span>
                    <div className="icon-actions">
                      <button type="button" title="Edit task" aria-label={`Edit ${task.title}`} onClick={() => startEditing(task)}>
                        <Edit3 size={18} />
                      </button>
                      <button type="button" title="Delete task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
