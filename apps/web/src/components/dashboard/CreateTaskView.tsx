"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import DatePicker from "../DatePicker";

interface CreateTaskViewProps {
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskGroup: string;
  setNewTaskGroup: (val: string) => void;
  newTaskDueDate: number | null;
  setNewTaskDueDate: (val: number | null) => void;
  newTaskFormat: "text" | "checklist";
  setNewTaskFormat: (val: "text" | "checklist") => void;
  newTaskNotesText: string;
  setNewTaskNotesText: (val: string) => void;
  newSubTodos: string[];
  setNewSubTodos: (val: string[]) => void;
  subTodoInput: string;
  setSubTodoInput: (val: string) => void;
  handleAddSubTodo: () => void;
  createTodo: () => Promise<void>;
  setActiveView: (view: "tasks" | "settings" | "create_task") => void;
  groups: string[];
  newCategoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  isNewTaskCategoryOpen: boolean;
  setIsNewTaskCategoryOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function CreateTaskView({
  newTaskTitle,
  setNewTaskTitle,
  newTaskGroup,
  setNewTaskGroup,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskFormat,
  setNewTaskFormat,
  newTaskNotesText,
  setNewTaskNotesText,
  newSubTodos,
  setNewSubTodos,
  subTodoInput,
  setSubTodoInput,
  handleAddSubTodo,
  createTodo,
  setActiveView,
  groups,
  newCategoryDropdownRef,
  isNewTaskCategoryOpen,
  setIsNewTaskCategoryOpen,
  inputRef
}: CreateTaskViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 max-w-3xl w-full mx-auto flex flex-col justify-start"
    >
      {/* Header */}
      <div className="mb-8 select-none">
        <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-bold uppercase tracking-wider mb-2">
          <span className="hover:text-zinc-350 cursor-pointer" onClick={() => setActiveView("tasks")}>Tasks</span>
          <span>/</span>
          <span className="text-zinc-400">New Task</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Create a new task
        </h1>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/10 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
        {/* Title Input */}
        <div>
          <label className="mb-2 block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest select-none">
            Title
          </label>
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done? (e.g. find bugs in melofy)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all font-semibold"
            autoFocus
          />
        </div>

        {/* Format Toggle & Label */}
        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest select-none">
              Task Format
            </label>
            <p className="text-[10px] text-zinc-500 mt-1 select-none font-medium">
              Choose between a nested checklist or a rich text description.
            </p>
          </div>
          
          {/* Format Toggle Selector */}
          <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl max-w-xs shrink-0 select-none">
            <button
              type="button"
              onClick={() => setNewTaskFormat("checklist")}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold transition-all cursor-pointer ${
                newTaskFormat === "checklist"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Checklist
            </button>
            <button
              type="button"
              onClick={() => setNewTaskFormat("text")}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold transition-all cursor-pointer ${
                newTaskFormat === "text"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Text Note
            </button>
          </div>
        </div>

        {/* Notes/Checklist Content slot */}
        <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 min-h-[320px] flex flex-col justify-between">
          {newTaskFormat === "checklist" ? (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Checklist items list */}
              <div className="flex-1 max-h-[300px] overflow-y-auto pr-1">
                {newSubTodos.length === 0 ? (
                  <div className="h-full min-h-[220px] flex items-center justify-center text-xs text-zinc-650 italic select-none">
                    Checklist is empty. Add items below!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newSubTodos.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300">
                        <span className="truncate flex-1 font-semibold">{sub}</span>
                        <button
                          type="button"
                          onClick={() => setNewSubTodos(newSubTodos.filter((_, i) => i !== idx))}
                          className="text-zinc-550 hover:text-red-450 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Item Field */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <input
                  type="text"
                  value={subTodoInput}
                  onChange={(e) => setSubTodoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubTodo();
                    }
                  }}
                  onPaste={(e) => {
                    const pasteData = e.clipboardData.getData("text");
                    if (pasteData.includes("\n")) {
                      e.preventDefault();
                      const lines = pasteData.split("\n").map(l => l.trim()).filter(Boolean);
                      if (lines.length > 0) {
                        setNewSubTodos([...newSubTodos, ...lines]);
                      }
                    }
                  }}
                  placeholder="Add a checklist item (Press Enter)"
                  className="flex-1 bg-transparent text-xs text-zinc-350 placeholder-zinc-500 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddSubTodo}
                  className="text-2xs font-bold text-zinc-300 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <textarea
              value={newTaskNotesText}
              onChange={(e) => setNewTaskNotesText(e.target.value)}
              placeholder="Write down details or notes for this task..."
              className="w-full flex-1 min-h-[250px] bg-transparent text-xs text-zinc-200 placeholder-zinc-550 outline-none resize-none"
            />
          )}
        </div>

        {/* Grid of options: Category & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
          <div>
            <label className="mb-2 block text-2xs font-extrabold text-zinc-400 uppercase tracking-widest select-none">
              Category
            </label>
            <div className="relative" ref={newCategoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNewTaskCategoryOpen(!isNewTaskCategoryOpen)}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-350 hover:border-white/20 hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <span className="text-zinc-100">{newTaskGroup}</span>
                <ChevronRight className="h-4 w-4 rotate-90 text-zinc-400 shrink-0" />
              </button>
              <AnimatePresence>
                {isNewTaskCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 mt-2 z-50 w-full rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-1 shadow-2xl max-h-48 overflow-y-auto"
                  >
                    {groups.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setNewTaskGroup(g);
                          setIsNewTaskCategoryOpen(false);
                        }}
                        className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                          newTaskGroup === g
                            ? "bg-white/10 text-white font-bold"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-2xs font-extrabold text-zinc-400 uppercase tracking-widest select-none">
              Due Date
            </label>
            <DatePicker
              value={newTaskDueDate}
              onChange={(val) => setNewTaskDueDate(val)}
              placeholder="Select due date"
            />
          </div>
        </div>

        {/* Create Task buttons */}
        <div className="flex gap-3 pt-6 border-t border-white/5 select-none">
          <button
            onClick={async () => {
              await createTodo();
              setActiveView("tasks");
            }}
            disabled={!newTaskTitle.trim()}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-black text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-98"
          >
            Create Task
          </button>
          <button
            onClick={() => {
              setNewTaskTitle("");
              setNewSubTodos([]);
              setNewTaskNotesText("");
              setNewTaskDueDate(null);
              setActiveView("tasks");
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
