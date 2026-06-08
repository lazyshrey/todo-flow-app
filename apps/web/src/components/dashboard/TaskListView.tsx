"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ListOrdered, CheckCircle2 } from "lucide-react";
import { TodoItem, Filter } from "./types";
import TaskRow from "./TaskRow";

interface TaskListViewProps {
  todos: TodoItem[];
  filteredTodos: TodoItem[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  selectedGroup: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: "createdAtDesc" | "createdAtAsc" | "dueDate" | "status";
  setSortBy: (s: "createdAtDesc" | "createdAtAsc" | "dueDate" | "status") => void;
  isSortOpen: boolean;
  setIsSortOpen: (open: boolean) => void;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
  toggleSubTodo: (todo: TodoItem, index: number) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  openEditDialog: (todo: TodoItem) => void;
  exportToMarkdown: (todo: TodoItem) => void;
  copiedTaskId: string | null;
  counts: { all: number; pending: number; completed: number };
}

export default function TaskListView({
  todos,
  filteredTodos,
  filter,
  setFilter,
  selectedGroup,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  isSortOpen,
  setIsSortOpen,
  sortDropdownRef,
  toggleTodo,
  toggleSubTodo,
  deleteTodo,
  openEditDialog,
  exportToMarkdown,
  copiedTaskId,
  counts
}: TaskListViewProps) {
  return (
    <>
      {/* Task Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 select-none">
          {selectedGroup === "All" ? "All Tasks" : selectedGroup}
        </h1>
        <p className="text-xs text-zinc-400 select-none">
          {selectedGroup === "All"
            ? "Showing todos across all categories."
            : `Showing tasks categorized in "${selectedGroup}".`}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6 select-none">
        {/* Tabs */}
        <div className="flex gap-1">
          {(["all", "pending", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                filter === f ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-2xs text-zinc-500 font-bold">
                ({counts[f]})
              </span>
              {filter === f && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100"
                />
              )}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Filter (Left) */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            >
              <ListOrdered className="h-3.5 w-3.5 text-zinc-450" />
              <span>
                {sortBy === "createdAtDesc"
                  ? "Newest"
                  : sortBy === "createdAtAsc"
                  ? "Oldest"
                  : sortBy === "dueDate"
                  ? "Due Date"
                  : "Status"}
              </span>
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 mt-2 z-50 w-32 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-1 shadow-2xl space-y-0.5"
                >
                  <button
                    onClick={() => {
                      setSortBy("createdAtDesc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                      sortBy === "createdAtDesc"
                        ? "bg-white/10 text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("createdAtAsc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                      sortBy === "createdAtAsc"
                        ? "bg-white/10 text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("dueDate");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                      sortBy === "dueDate"
                        ? "bg-white/10 text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Due Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("status");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                      sortBy === "status"
                        ? "bg-white/10 text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Status
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Pill (Right) */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-550 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all w-40 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks list renderer */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {filteredTodos.length === 0 ? (
            <motion.div
              key="empty-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] select-none"
            >
              <div className="mb-3 text-zinc-650">
                <CheckCircle2 className="mx-auto h-12 w-12" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">
                {filter === "all"
                  ? "No tasks in this category. Add one above!"
                  : filter === "pending"
                  ? "All caught up!"
                  : "No completed tasks yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredTodos.map((todo, index) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  index={index}
                  toggleTodo={toggleTodo}
                  toggleSubTodo={toggleSubTodo}
                  deleteTodo={deleteTodo}
                  openEditDialog={openEditDialog}
                  exportToMarkdown={exportToMarkdown}
                  copiedTaskId={copiedTaskId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
