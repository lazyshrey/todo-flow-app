"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Share2,
  Pencil,
  Trash2,
  Check
} from "lucide-react";
import { TodoItem } from "./types";
import {
  formatDueDate,
  formatRelativeTime,
  getNotesFormat,
  parseSubTodos
} from "./helpers";

interface TaskRowProps {
  todo: TodoItem;
  index: number;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
  toggleSubTodo: (todo: TodoItem, index: number) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  openEditDialog: (todo: TodoItem) => void;
  exportToMarkdown: (todo: TodoItem) => void;
  copiedTaskId: string | null;
}

export default function TaskRow({
  todo,
  index,
  toggleTodo,
  toggleSubTodo,
  deleteTodo,
  openEditDialog,
  exportToMarkdown,
  copiedTaskId
}: TaskRowProps) {
  const dueInfo = formatDueDate(todo.dueDate);
  const format = getNotesFormat(todo.notes);
  const subTodos = parseSubTodos(todo.notes);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={`group flex flex-col justify-between gap-3 border border-white/5 p-4 rounded-2xl bg-zinc-950/20 backdrop-blur-md transition-all duration-300 relative overflow-hidden ${
        todo.completed
          ? "border-white/5 bg-white/[0.015]"
          : "hover:bg-white/[0.02] hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => toggleTodo(todo.id, todo.completed)}
          className="flex-shrink-0 text-zinc-655 hover:text-zinc-300 transition-all duration-300 mt-0.5 cursor-pointer"
        >
          {todo.completed ? (
            <CheckCircle2 className="h-5 w-5 text-white" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p
              className={`text-sm font-semibold transition-colors truncate select-text ${
                todo.completed
                  ? "text-zinc-550 line-through"
                  : "text-zinc-200 group-hover:text-white"
              }`}
            >
              {todo.title}
            </p>

            <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-zinc-450 font-semibold select-none">
              {todo.groupName || "Inbox"}
            </span>
          </div>

          {/* Checklist Format rendering */}
          {format === "checklist" && subTodos.length > 0 && (
            <div className="mt-3 space-y-2 border-l border-white/10 pl-3 py-0.5">
              {subTodos.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 select-none">
                  <button
                    onClick={() => toggleSubTodo(todo, idx)}
                    className="flex-shrink-0 text-zinc-650 hover:text-zinc-300 transition-all duration-300 cursor-pointer"
                  >
                    {sub.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-450" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={`text-xs transition-colors font-medium ${
                      sub.completed ? "text-zinc-555 line-through" : "text-zinc-350"
                    }`}
                  >
                    {sub.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Text Format rendering */}
          {format === "text" && todo.notes && (
            <p className="text-xs text-zinc-400 mt-2 whitespace-pre-wrap select-text leading-relaxed">
              {todo.notes}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-550 font-semibold mt-3 select-none">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-500" />
              Created {formatRelativeTime(todo.createdAt)}
            </span>

            {todo.completed && todo.updatedAt && (
              <span className="flex items-center gap-1 text-zinc-450">
                <CheckCircle2 className="h-3 w-3 text-zinc-500" />
                Done {formatRelativeTime(todo.updatedAt)}
              </span>
            )}

            {dueInfo && (
              <span
                className={`flex items-center gap-1 ${
                  dueInfo.isOverdue
                    ? "text-red-400 font-extrabold animate-pulse"
                    : "text-zinc-400"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {dueInfo.text}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity self-start select-none">
          <button
            onClick={() => exportToMarkdown(todo)}
            className="rounded-lg p-2 text-zinc-550 hover:bg-white/5 hover:text-emerald-450 transition-colors cursor-pointer"
            title="Export to Markdown Clipboard"
          >
            {copiedTaskId === todo.id ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => openEditDialog(todo)}
            className="rounded-lg p-2 text-zinc-550 hover:bg-white/5 hover:text-zinc-300 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="rounded-lg p-2 text-zinc-550 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
