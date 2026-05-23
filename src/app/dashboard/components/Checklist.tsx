"use client";

import { useState } from "react";
import { Trash2, Check, Edit2, X } from "lucide-react";
import { TaskItem } from "../types";

interface ChecklistProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, "id">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask?: (id: string, task: Omit<TaskItem, "id">) => void;
}

const CATEGORIES = [
  "Venue & Catering",
  "Apparel & Grooming",
  "Rings & Legal Documents",
  "Invitations & RSVP",
  "Decor & Floral Design",
  "Supplier Coordination",
  "Photography & Moments",
  "Entertainment & Sound",
  "Miscellaneous",
];

export default function Checklist({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}: ChecklistProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "completed">("all");

  // Editing State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      category,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
    };

    if (editingTask) {
      if (onUpdateTask) {
        onUpdateTask(editingTask.id, {
          ...taskData,
          status: editingTask.status,
        });
      }
      setEditingTask(null);
    } else {
      onAddTask({
        ...taskData,
        status: "todo",
      });
    }

    setTitle("");
    setDueDate("");
  };

  const handleStartEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setCategory(CATEGORIES[0]);
    setDueDate("");
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "todo") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Checklist Stats Card */}
      <div className="bg-white border border-black/5 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Wedding Planning Checklist Progress
            </h3>
            <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-0.5">
              Keep track of key tasks leading up to your big day
            </p>
          </div>
          <div className="text-right">
            <span className="text-[24px] font-bold text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)]">
              {progressPercent.toFixed(0)}%
            </span>
            <span className="text-[11px] text-neutral-400 font-bold block uppercase tracking-wider">Completed</span>
          </div>
        </div>

        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#a68b6a] to-[#c1a887] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Total Tasks</span>
            <span className="text-[18px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">{total}</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-[18px] font-bold text-emerald-600 font-[family-name:var(--font-plus-jakarta)]">{completed}</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Pending Tasks</span>
            <span className="text-[18px] font-bold text-amber-600 font-[family-name:var(--font-plus-jakarta)]">{todo + inProgress}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Quick Add Task Form */}
        <div className="w-full lg:w-[350px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm self-start">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              {editingTask ? "Edit Planning Task" : "Add Planning Task"}
            </h3>
            {editingTask && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg cursor-pointer"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule gowns fitting session"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div className="flex gap-2">
              {editingTask && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
              >
                {editingTask ? "Save" : "Add Task"}
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Tasks
            </h3>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#fafafa] border border-black/[0.04] p-1 rounded-lg">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === "all" ? "bg-white text-[#a68b6a] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("todo")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === "todo" ? "bg-white text-[#a68b6a] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === "completed" ? "bg-white text-[#a68b6a] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-neutral-400">No tasks found matching filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === "completed";
                const isOverdue = new Date(t.dueDate) < new Date() && !isCompleted;

                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isCompleted ? "bg-[#fafafa]/80 border-black/5 opacity-60" : "bg-white border-black/5 hover:border-neutral-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 pr-4">
                      {/* Checkbox trigger button */}
                      <button
                        onClick={() => onToggleTask(t.id)}
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          isCompleted
                            ? "bg-[#a68b6a] border-[#a68b6a] text-white"
                            : "border-black/[0.15] bg-white hover:border-[#a68b6a]"
                        }`}
                      >
                        {isCompleted && (
                          <Check size={11} strokeWidth={3} />
                        )}
                      </button>

                      <div className="flex-1">
                        <h4 className={`text-[13px] font-semibold font-[family-name:var(--font-plus-jakarta)] leading-relaxed text-neutral-800 ${isCompleted ? "line-through text-neutral-400" : ""}`}>
                          {t.title}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {t.category}
                          </span>
                          <span className="text-neutral-300 text-[10px]">·</span>
                          <span className={`text-[10px] font-semibold ${isOverdue ? "text-red-500 font-bold" : "text-neutral-400"}`}>
                            Due: {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            {isOverdue && " (Overdue)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 text-neutral-400 hover:text-[#a68b6a] hover:bg-[#a68b6a]/5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Edit task"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
