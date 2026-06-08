"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import DatePicker from "../DatePicker";
import { TodoItem, SubTodo } from "./types";

interface EditTaskDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  editingTodo: TodoItem | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editGroup: string;
  setEditGroup: (val: string) => void;
  editDueDate: number | null;
  setEditDueDate: (val: number | null) => void;
  editTaskFormat: "text" | "checklist";
  setEditTaskFormat: (val: "text" | "checklist") => void;
  editNotesText: string;
  setEditNotesText: (val: string) => void;
  editSubTodos: SubTodo[];
  setEditSubTodos: (val: SubTodo[]) => void;
  editSubTodoInput: string;
  setEditSubTodoInput: (val: string) => void;
  saveEdit: () => Promise<void>;
  closeEditDialog: () => void;
  groups: string[];
  editCategoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  isEditCategoryOpen: boolean;
  setIsEditCategoryOpen: (open: boolean) => void;
}

export default function EditTaskDialog({
  dialogRef,
  editingTodo,
  editTitle,
  setEditTitle,
  editGroup,
  setEditGroup,
  editDueDate,
  setEditDueDate,
  editTaskFormat,
  setEditTaskFormat,
  editNotesText,
  setEditNotesText,
  editSubTodos,
  setEditSubTodos,
  editSubTodoInput,
  setEditSubTodoInput,
  saveEdit,
  closeEditDialog,
  groups,
  editCategoryDropdownRef,
  isEditCategoryOpen,
  setIsEditCategoryOpen
}: EditTaskDialogProps) {
  if (!editingTodo) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6 shadow-2xl overflow-visible"
      onClick={(e) => e.target === dialogRef.current && closeEditDialog()}
    >
      <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 select-none">
          <Sparkles className="h-4 w-4 text-zinc-400" />
          Edit Task List
        </h2>
        <button
          onClick={closeEditDialog}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
          {/* Left Column: Tweaks (Title, Category, Due Date, Mode/Format) */}
          <div className="md:col-span-3 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all duration-300 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                  Category
                </label>
                <div className="relative" ref={editCategoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsEditCategoryOpen(!isEditCategoryOpen)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 hover:border-white/20 hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <span className="text-zinc-100">{editGroup}</span>
                    <ChevronRight className="h-4 w-4 rotate-90 text-zinc-400 shrink-0" />
                  </button>
                  <AnimatePresence>
                    {isEditCategoryOpen && (
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
                              setEditGroup(g);
                              setIsEditCategoryOpen(false);
                            }}
                            className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                              editGroup === g
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
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                  Due Date
                </label>
                <DatePicker
                  value={editDueDate}
                  onChange={(val) => setEditDueDate(val)}
                  placeholder="Select due date"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                Task Format
              </label>
              <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl max-w-xs select-none">
                <button
                  type="button"
                  onClick={() => setEditTaskFormat("checklist")}
                  className={`flex-1 text-center py-1 rounded-lg text-2xs font-extrabold transition-all cursor-pointer ${
                    editTaskFormat === "checklist"
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setEditTaskFormat("text")}
                  className={`flex-1 text-center py-1 rounded-lg text-2xs font-extrabold transition-all cursor-pointer ${
                    editTaskFormat === "text"
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Text Note
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Content (Checklist or Text Note) */}
          <div className="md:col-span-7 flex flex-col h-full justify-between">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                {editTaskFormat === "checklist" ? "Checklist Items" : "Notes / Details"}
              </label>
              
              <div className="h-[280px] border border-white/10 bg-white/5 rounded-xl relative">
                {editTaskFormat === "checklist" ? (
                  <div className="h-full flex flex-col justify-between p-3.5 space-y-2">
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                      {editSubTodos.map((sub, idx) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sub.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditSubTodos(
                                editSubTodos.map((item, i) =>
                                  i === idx ? { ...item, text: val } : item
                                )
                              );
                            }}
                            className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-200 font-semibold outline-none focus:border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => setEditSubTodos(editSubTodos.filter((_, i) => i !== idx))}
                            className="p-1 text-zinc-555 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {editSubTodos.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-semibold select-none">
                          Checklist is empty. Add items below!
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1.5 border-t border-white/5 select-none">
                      <input
                        type="text"
                        placeholder="Add checklist item..."
                        value={editSubTodoInput}
                        onChange={(e) => setEditSubTodoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (editSubTodoInput.trim()) {
                              const lines = editSubTodoInput.split("\n").map(l => l.trim()).filter(Boolean);
                              const newItems = lines.map((text, i) => ({
                                id: `${Date.now()}-${Math.random()}-${i}`,
                                text,
                                completed: false
                              }));
                              setEditSubTodos([...editSubTodos, ...newItems]);
                              setEditSubTodoInput("");
                            }
                          }
                        }}
                        onPaste={(e) => {
                          const pasteData = e.clipboardData.getData("text");
                          if (pasteData.includes("\n")) {
                            e.preventDefault();
                            const lines = pasteData.split("\n").map(l => l.trim()).filter(Boolean);
                            const newItems = lines.map((text, i) => ({
                              id: `${Date.now()}-${Math.random()}-${i}`,
                              text,
                              completed: false
                            }));
                            if (newItems.length > 0) {
                              setEditSubTodos([...editSubTodos, ...newItems]);
                            }
                          }
                        }}
                        className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-550 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editSubTodoInput.trim()) {
                            const lines = editSubTodoInput.split("\n").map(l => l.trim()).filter(Boolean);
                            const newItems = lines.map((text, i) => ({
                              id: `${Date.now()}-${Math.random()}-${i}`,
                              text,
                              completed: false
                            }));
                            setEditSubTodos([...editSubTodos, ...newItems]);
                            setEditSubTodoInput("");
                          }
                        }}
                        className="text-2xs font-bold text-zinc-300 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={editNotesText}
                    onChange={(e) => setEditNotesText(e.target.value)}
                    placeholder="Write task description/notes..."
                    className="w-full h-full bg-transparent p-3.5 text-xs text-zinc-200 placeholder-zinc-550 outline-none resize-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/5 select-none">
          <button
            onClick={saveEdit}
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={closeEditDialog}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
