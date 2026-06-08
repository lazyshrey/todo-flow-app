"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { TodoItem, SubTodo, Filter, DiscordStatus, TokenItem } from "./dashboard/types";
import { getNotesFormat, parseSubTodos, serializeSubTodos } from "./dashboard/helpers";
import Sidebar from "./dashboard/Sidebar";
import SettingsView from "./dashboard/SettingsView";
import CreateTaskView from "./dashboard/CreateTaskView";
import TaskListView from "./dashboard/TaskListView";
import EditTaskDialog from "./dashboard/EditTaskDialog";

export default function Dashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [customGroups, setCustomGroups] = useState<string[]>([]);
  
  // Layout States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<"tasks" | "settings" | "create_task">("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAtDesc" | "createdAtAsc" | "dueDate" | "status">("createdAtDesc");
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  // New task states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskGroup, setNewTaskGroup] = useState("Inbox");
  const [newTaskDueDate, setNewTaskDueDate] = useState<number | null>(null);
  const [newTaskFormat, setNewTaskFormat] = useState<"text" | "checklist">("checklist");
  const [newTaskNotesText, setNewTaskNotesText] = useState("");
  const [newSubTodos, setNewSubTodos] = useState<string[]>([]);
  const [subTodoInput, setSubTodoInput] = useState("");

  // Edit task states
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGroup, setEditGroup] = useState("Inbox");
  const [editDueDate, setEditDueDate] = useState<number | null>(null);
  const [editTaskFormat, setEditTaskFormat] = useState<"text" | "checklist">("checklist");
  const [editNotesText, setEditNotesText] = useState("");
  const [editSubTodos, setEditSubTodos] = useState<SubTodo[]>([]);
  const [editSubTodoInput, setEditSubTodoInput] = useState("");

  // Settings states
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [linkCode, setLinkCode] = useState("");
  const [linkMessage, setLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Custom Dropdown Refs & States
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isNewTaskCategoryOpen, setIsNewTaskCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const newCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const editCategoryDropdownRef = useRef<HTMLDivElement>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultGroups = ["Inbox", "Work", "Personal"];
  const allGroupsSet = new Set([
    ...defaultGroups,
    ...todos.map((t) => t.groupName || "Inbox"),
    ...customGroups,
  ]);
  const groups = Array.from(allGroupsSet);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const fetchDiscordStatus = async () => {
    try {
      const res = await fetch("/api/auth/link");
      if (res.ok) {
        const data = await res.json();
        setDiscordStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Discord status:", error);
    }
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/mcp/tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (activeView === "settings") {
      fetchDiscordStatus();
      fetchTokens();
    }
  }, [activeView]);

  useEffect(() => {
    if (selectedGroup !== "All" && newTaskGroup !== selectedGroup) {
      setNewTaskGroup(selectedGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // Click outside custom dropdowns handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setIsSortOpen(false);
      }
      if (newCategoryDropdownRef.current && !newCategoryDropdownRef.current.contains(target)) {
        setIsNewTaskCategoryOpen(false);
      }
      if (editCategoryDropdownRef.current && !editCategoryDropdownRef.current.contains(target)) {
        setIsEditCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dialog reactively when editingTodo is set
  useEffect(() => {
    if (editingTodo) {
      dialogRef.current?.showModal();
    }
  }, [editingTodo]);

  const linkDiscord = async () => {
    if (!linkCode || linkCode.length !== 6) {
      setLinkMessage({ type: "error", text: "Please enter a valid 6-digit code" });
      return;
    }
    try {
      const res = await fetch("/api/auth/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: linkCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkMessage({ type: "success", text: "Discord account linked successfully!" });
        setLinkCode("");
        fetchDiscordStatus();
      } else {
        setLinkMessage({ type: "error", text: data.error || "Failed to link account" });
      }
    } catch (error) {
      setLinkMessage({ type: "error", text: "An error occurred" });
    }
  };

  const unlinkDiscord = async () => {
    try {
      const res = await fetch("/api/auth/link", { method: "DELETE" });
      if (res.ok) {
        setDiscordStatus({ discordId: null });
        setLinkMessage({ type: "success", text: "Discord account unlinked" });
      }
    } catch (error) {
      setLinkMessage({ type: "error", text: "Failed to unlink account" });
    }
  };

  const generateToken = async () => {
    if (!newTokenName.trim()) return;
    try {
      const res = await fetch("/api/mcp/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTokenName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.token);
        setNewTokenName("");
        fetchTokens();
      }
    } catch (error) {
      console.error("Failed to generate token:", error);
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const res = await fetch("/api/mcp/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenId }),
      });
      if (res.ok) {
        setTokens(tokens.filter((t) => t.id !== tokenId));
      }
    } catch (error) {
      console.error("Failed to delete token:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSubTodo = () => {
    if (!subTodoInput.trim()) return;
    const lines = subTodoInput.split("\n").map(l => l.trim()).filter(Boolean);
    setNewSubTodos([...newSubTodos, ...lines]);
    setSubTodoInput("");
  };

  const createTodo = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const activeGroup = newTaskGroup;
      const dueDateTimestamp = newTaskDueDate;
      
      let serializedNotes = "";
      if (newTaskFormat === "checklist") {
        const subTodoObjects = newSubTodos.map((text) => ({
          id: `${Date.now()}-${Math.random()}`,
          text,
          completed: false
        }));
        serializedNotes = serializeSubTodos(subTodoObjects);
      } else {
        serializedNotes = newTaskNotesText.trim();
      }

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          groupName: activeGroup,
          dueDate: dueDateTimestamp,
          notes: serializedNotes
        }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos([todo, ...todos]);
        setNewTaskTitle("");
        setNewSubTodos([]);
        setNewTaskNotesText("");
        setNewTaskDueDate(null);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos(todos.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const toggleSubTodo = async (todo: TodoItem, subTodoIndex: number) => {
    const subTodosList = parseSubTodos(todo.notes);
    if (subTodosList[subTodoIndex]) {
      subTodosList[subTodoIndex].completed = !subTodosList[subTodoIndex].completed;
      const updatedNotes = serializeSubTodos(subTodosList);
      
      setTodos(
        todos.map((t) =>
          t.id === todo.id ? { ...t, notes: updatedNotes, updatedAt: Date.now() } : t
        )
      );

      try {
        await fetch(`/api/todos/${todo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: updatedNotes }),
        });
      } catch (error) {
        console.error("Failed to toggle sub-todo:", error);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const openEditDialog = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditGroup(todo.groupName || "Inbox");
    
    const format = getNotesFormat(todo.notes);
    setEditTaskFormat(format);
    
    if (format === "checklist") {
      setEditSubTodos(parseSubTodos(todo.notes));
      setEditNotesText("");
    } else {
      setEditNotesText(todo.notes || "");
      setEditSubTodos([]);
    }

    setEditSubTodoInput("");
    
    if (todo.dueDate) {
      setEditDueDate(todo.dueDate);
    } else {
      setEditDueDate(null);
    }
  };

  const closeEditDialog = () => {
    dialogRef.current?.close();
    setEditingTodo(null);
  };

  const saveEdit = async () => {
    if (!editingTodo || !editTitle.trim()) return;
    try {
      const dueDateTimestamp = editDueDate;
      let updatedNotes = "";
      if (editTaskFormat === "checklist") {
        updatedNotes = serializeSubTodos(editSubTodos);
      } else {
        updatedNotes = editNotesText.trim();
      }

      const res = await fetch(`/api/todos/${editingTodo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          groupName: editGroup,
          dueDate: dueDateTimestamp,
          notes: updatedNotes
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
        closeEditDialog();
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const exportToMarkdown = (todo: TodoItem) => {
    const format = getNotesFormat(todo.notes);
    let md = `Task: ${todo.title} Category: ${todo.groupName || "Inbox"}\nTodos:\n`;
    
    if (format === "checklist") {
      const subTodosList = parseSubTodos(todo.notes);
      if (subTodosList.length > 0) {
        subTodosList.forEach((sub) => {
          md += `- ${sub.text}\n`;
        });
      } else {
        md += `- (No todos added)\n`;
      }
    } else {
      if (todo.notes) {
        md += `${todo.notes}\n`;
      } else {
        md += `- (No details added)\n`;
      }
    }

    navigator.clipboard.writeText(md);
    setCopiedTaskId(todo.id);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "pending" && todo.completed) return false;
      if (filter === "completed" && !todo.completed) return false;
      if (selectedGroup !== "All" && (todo.groupName || "Inbox") !== selectedGroup) return false;
      
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const titleMatch = todo.title.toLowerCase().includes(query);
        const notesMatch = todo.notes?.toLowerCase().includes(query);
        if (!titleMatch && !notesMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "createdAtDesc") {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === "createdAtAsc") {
        return a.createdAt - b.createdAt;
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      }
      if (sortBy === "status") {
        if (a.completed === b.completed) return b.createdAt - a.createdAt;
        return a.completed ? 1 : -1;
      }
      return 0;
    });

  const counts = {
    all: todos.filter((t) => {
      if (selectedGroup !== "All" && (t.groupName || "Inbox") !== selectedGroup) return false;
      return true;
    }).length,
    pending: todos.filter((t) => {
      if (t.completed) return false;
      if (selectedGroup !== "All" && (t.groupName || "Inbox") !== selectedGroup) return false;
      return true;
    }).length,
    completed: todos.filter((t) => {
      if (!t.completed) return false;
      if (selectedGroup !== "All" && (t.groupName || "Inbox") !== selectedGroup) return false;
      return true;
    }).length,
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groups={groups}
        customGroups={customGroups}
        setCustomGroups={setCustomGroups}
        todos={todos}
      />

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col relative z-10 bg-zinc-950">
        {/* Background Dot Mesh (No light rays) */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,#000_50%,transparent_100%)] pointer-events-none z-0" />

        <div className="flex-1 relative z-10 max-w-4xl w-full mx-auto px-6 sm:px-10 pt-20 sm:pt-12 pb-12 flex flex-col">
          <AnimatePresence mode="wait">
            {activeView === "create_task" ? (
              <CreateTaskView
                key="create_task"
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskGroup={newTaskGroup}
                setNewTaskGroup={setNewTaskGroup}
                newTaskDueDate={newTaskDueDate}
                setNewTaskDueDate={setNewTaskDueDate}
                newTaskFormat={newTaskFormat}
                setNewTaskFormat={setNewTaskFormat}
                newTaskNotesText={newTaskNotesText}
                setNewTaskNotesText={setNewTaskNotesText}
                newSubTodos={newSubTodos}
                setNewSubTodos={setNewSubTodos}
                subTodoInput={subTodoInput}
                setSubTodoInput={setSubTodoInput}
                handleAddSubTodo={handleAddSubTodo}
                createTodo={createTodo}
                setActiveView={setActiveView}
                groups={groups}
                newCategoryDropdownRef={newCategoryDropdownRef}
                isNewTaskCategoryOpen={isNewTaskCategoryOpen}
                setIsNewTaskCategoryOpen={setIsNewTaskCategoryOpen}
                inputRef={inputRef}
              />
            ) : activeView === "settings" ? (
              <SettingsView
                key="settings"
                discordStatus={discordStatus}
                linkCode={linkCode}
                setLinkCode={setLinkCode}
                linkMessage={linkMessage}
                linkDiscord={linkDiscord}
                unlinkDiscord={unlinkDiscord}
                tokens={tokens}
                newTokenName={newTokenName}
                setNewTokenName={setNewTokenName}
                generatedToken={generatedToken}
                setGeneratedToken={setGeneratedToken}
                generateToken={generateToken}
                deleteToken={deleteToken}
                copyToClipboard={copyToClipboard}
                copied={copied}
              />
            ) : (
              <TaskListView
                key="tasks"
                todos={todos}
                filteredTodos={filteredTodos}
                filter={filter}
                setFilter={setFilter}
                selectedGroup={selectedGroup}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isSortOpen={isSortOpen}
                setIsSortOpen={setIsSortOpen}
                sortDropdownRef={sortDropdownRef}
                toggleTodo={toggleTodo}
                toggleSubTodo={toggleSubTodo}
                deleteTodo={deleteTodo}
                openEditDialog={openEditDialog}
                exportToMarkdown={exportToMarkdown}
                copiedTaskId={copiedTaskId}
                counts={counts}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Task Edit Dialog */}
      <EditTaskDialog
        dialogRef={dialogRef}
        editingTodo={editingTodo}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editGroup={editGroup}
        setEditGroup={setEditGroup}
        editDueDate={editDueDate}
        setEditDueDate={setEditDueDate}
        editTaskFormat={editTaskFormat}
        setEditTaskFormat={setEditTaskFormat}
        editNotesText={editNotesText}
        setEditNotesText={setEditNotesText}
        editSubTodos={editSubTodos}
        setEditSubTodos={setEditSubTodos}
        editSubTodoInput={editSubTodoInput}
        setEditSubTodoInput={setEditSubTodoInput}
        saveEdit={saveEdit}
        closeEditDialog={closeEditDialog}
        groups={groups}
        editCategoryDropdownRef={editCategoryDropdownRef}
        isEditCategoryOpen={isEditCategoryOpen}
        setIsEditCategoryOpen={setIsEditCategoryOpen}
      />
    </div>
  );
}
