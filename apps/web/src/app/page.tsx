"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Globe,
  MessageSquare,
  Terminal,
  Zap,
  Shield,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import SideRays from "@/components/SideRays";

interface MockTodo {
  id: string;
  title: string;
  completed: boolean;
}

function InteractiveMock() {
  const [todos, setTodos] = useState<MockTodo[]>([
    { id: "1", title: "Review pull request #42", completed: false },
    { id: "2", title: "Deploy to staging", completed: true },
    { id: "3", title: "Write unit tests", completed: false },
  ]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    const taskTitle = input.trim();
    setTodos([
      ...todos,
      { id: Date.now().toString(), title: taskTitle, completed: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const nextState = !todo.completed;
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: nextState } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditVal(title);
  };

  const saveEdit = (id: string) => {
    if (!editVal.trim()) return;
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, title: editVal.trim() } : t))
    );
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-2xl p-6 relative group hover:border-white/20 transition-all duration-500 z-10"
    >
      <div className="mb-4 flex gap-2 relative z-10">
        <input
          id="mock-todo-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/20 focus:bg-white/8 transition-all duration-300"
        />
        <button
          id="mock-todo-add-btn"
          onClick={addTodo}
          className="rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/15 hover:border-white/20 transition-all duration-300 border border-white/10 active:scale-95 cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="space-y-2 relative z-10 max-h-60 overflow-y-auto pr-1">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              id={`mock-todo-item-${todo.id}`}
              key={todo.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (editingId !== todo.id) {
                  toggleTodo(todo.id);
                }
              }}
              className={`group flex items-center justify-between gap-3 rounded-full border px-5 py-3 transition-all duration-355 ${
                editingId === todo.id ? "cursor-default" : "cursor-pointer"
              } ${
                todo.completed
                  ? "border-white/15 bg-white/3"
                  : "border-white/5 bg-white/1 hover:bg-white/3 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    todo.completed
                      ? "border-white bg-white/15"
                      : "border-zinc-700 group-hover:border-zinc-550"
                  }`}
                >
                  {todo.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                  )}
                </div>
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEdit(todo.id);
                      } else if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/20 transition-all duration-300"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`text-sm transition-colors duration-300 truncate ${
                      todo.completed
                        ? "text-zinc-500 line-through"
                        : "text-zinc-200 group-hover:text-white"
                    }`}
                  >
                    {todo.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {editingId === todo.id ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit(todo.id);
                      }}
                      className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Save edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Cancel edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(todo.id, todo.title);
                      }}
                      className="p-1.5 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      title="Edit task"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="p-1.5 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="feature-card rounded-3xl border border-white/5 bg-zinc-950/15 backdrop-blur-md p-6 transition-all duration-500 hover:bg-white/2 hover:border-white/15 relative group overflow-hidden"
    >
      <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-3 group-hover:scale-105 group-hover:border-white/20 transition-all duration-500">
        <Icon className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors duration-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-350">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors duration-350">{description}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Background Helpers to clip overflow without breaking sticky navbar */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dotted Mesh Background Pattern - Extremely Subtle & Static */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_60%_at_50%_35%,#000_50%,transparent_100%)]" />

        {/* WebGL Cascading Corner Light Rays */}
        <div className="absolute inset-x-0 top-0 h-[850px] pointer-events-none z-0 mask-[linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <SideRays
            origin="top-right"
            rayColor1="#ffffff"
            rayColor2="#71717a"
            intensity={2.2}
            opacity={0.8}
            speed={1.0}
            spread={1.8}
          />
        </div>
      </div>

      <Header />

      <section id="hero" className="relative px-6 pt-24 pb-32 z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <motion.h1
              className="hero-title mb-6 text-5xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl leading-none"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Tasks that flow
              <br />
              <span className="bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
                everywhere you write code
              </span>
            </motion.h1>

            <motion.p
              className="hero-subtitle mx-auto mb-10 max-w-3xl text-md text-zinc-400 sm:text-lg leading-relaxed font-normal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              A transactional developer backlog syncing in real-time across your Next.js dashboard,
              a Node-hooked Discord bot, and a local MCP server for AI coding assistants.
            </motion.p>

            <motion.div
              className="hero-cta flex flex-col items-center justify-center gap-4 sm:flex-row relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <SignInButton mode="modal">
                <button
                  id="btn-get-started"
                  className="group flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100 transition-all duration-350 cursor-pointer active:scale-95"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  id="btn-create-account"
                  className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-bold text-zinc-100 backdrop-blur-xl hover:bg-white/10 hover:border-white/25 transition-all duration-350 cursor-pointer active:scale-95"
                >
                  Create Account
                </button>
              </SignUpButton>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="preview" className="relative px-6 py-24 border-t border-white/5 z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h2 className="text-2xl font-extrabold text-zinc-100 sm:text-3xl tracking-tight mb-3">
              Try the interactive playground
            </h2>
            <p className="mx-auto max-w-xl text-zinc-400 text-sm">
              Experience the real-time flow. Add and complete tasks in the mock dashboard below.
            </p>
          </div>
          <InteractiveMock />
        </div>
      </section>

      <section id="features" className="relative px-6 py-32 border-t border-white/5 z-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight">
              One source of truth, everywhere
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400">
              Your tasks stay synchronized across every platform you use, from
              your browser to your favorite tools.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Globe}
              title="Web Dashboard"
              description="Responsive Next.js application built with App Router and Server Actions, rendering your database state in a clean, card-less layout."
              delay={0}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Discord Bot (JSON API)"
              description="CRUD tasks using Discord slash commands, embeds, and modals. Securely linked to user profiles using ephemeral tokens."
              delay={0.05}
            />
            <a href="/docs" className="block">
              <FeatureCard
                icon={Terminal}
                title="Model Context Protocol"
                description="Expose backlog databases as structured tools to Claude Desktop, Cursor, and other AI IDEs over standard secure stdio. Click to view docs."
                delay={0.1}
              />
            </a>
            <FeatureCard
              icon={Zap}
              title="Transactional Sync"
              description="Database edits propagate instantly. Link accounts once and broadcast todo mutations across all workspaces in 45ms."
              delay={0.15}
            />
            <FeatureCard
              icon={Shield}
              title="Secure OAuth Auth"
              description="User authentication, session tokens, and custom developer MCP key creation managed via Clerk security providers."
              delay={0.2}
            />
            <FeatureCard
              icon={CheckSquare}
              title="Enmap SQLite Engine"
              description="Lightweight key-value transactional database backed by persistent SQLite. Fast, local, and zero-configuration."
              delay={0.25}
            />
          </div>

          <motion.section
            id="developers"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="grid gap-8 md:grid-cols-2 md:items-center relative z-10">
              <div>
                <h3 className="mb-4 text-2xl font-extrabold text-zinc-100 sm:text-3xl tracking-tight">
                  Built for developers
                </h3>
                <p className="mb-6 text-zinc-400 leading-relaxed text-sm">
                  Todo Flow integrates with your existing workflow. Use Discord
                  commands to manage tasks while gaming, or let your AI assistant
                  help prioritize your backlog through the MCP server.
                </p>
                <div className="flex flex-col gap-3.5 text-sm text-zinc-300">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    </div>
                    <span>
                      Type <code className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono">/todo link</code> in Discord
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    </div>
                    <span>Generate MCP tokens for AI assistants</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    </div>
                    <span>Everything stays in sync automatically</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-md p-6 font-mono text-sm hover:border-white/20 transition-all duration-500 relative">
                <div className="mb-4 flex items-center gap-2 text-zinc-500 border-b border-white/5 pb-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-zinc-800 border border-white/5" />
                    <div className="h-3 w-3 rounded-full bg-zinc-800 border border-white/5" />
                    <div className="h-3 w-3 rounded-full bg-zinc-800 border border-white/5" />
                  </div>
                  <span className="text-xs ml-1 font-semibold">terminal</span>
                </div>
                <div className="space-y-3.5 text-zinc-300 text-xs">
                  <div>
                    <span className="text-zinc-400">$</span> discord: /todo add
                    "Fix login bug"
                  </div>
                  <div className="text-zinc-500 pl-4 font-semibold">
                    ✓ Task created successfully
                  </div>
                  <div className="mt-3">
                    <span className="text-zinc-400">$</span> mcp: create task
                    "Deploy v2.0"
                  </div>
                  <div className="text-zinc-500 pl-4 font-semibold">
                    ✓ Task synced to dashboard
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </section>

      <WorkflowSection />
      <FaqSection />
      <SelfHostSection />

      <footer className="border-t border-white/5 px-6 py-8 relative z-10 bg-zinc-950">
        <div className="mx-auto max-w-6xl text-center text-xs text-zinc-500">
          <p>Built with Next.js, Clerk, and Enmap</p>
        </div>
      </footer>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="relative px-6 py-32 border-t border-white/5 z-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight">
            How Todo Flow keeps you synchronized
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            A seamless loop of capture, synchronization, and execution across your entire developer stack.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative p-8 rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-xl">
            <div className="absolute top-4 right-6 text-5xl font-extrabold text-white/5 select-none font-mono">01</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-3">Capture Anywhere</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Create tasks directly inside VS Code via the MCP Server, trigger <code className="text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded text-zinc-350">/todo add</code> in Discord, or key them into the web dashboard.
            </p>
          </div>
          <div className="relative p-8 rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-xl">
            <div className="absolute top-4 right-6 text-5xl font-extrabold text-white/5 select-none font-mono">02</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-3">Instant Sync</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Our lightweight persistent database propagates status updates in real-time. Changes are pushed to all connected endpoints instantly.
            </p>
          </div>
          <div className="relative p-8 rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-xl">
            <div className="absolute top-4 right-6 text-5xl font-extrabold text-white/5 select-none font-mono">03</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-3">Frictionless Action</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Complete and delete tasks wherever you are. Your AI context, chat channels, and dashboard stay in lockstep without manual copying.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "What is an MCP Server?",
      answer: "Model Context Protocol (MCP) is an open standard that allows AI assistants like Claude Desktop and Cursor to safely access local tools. Todo Flow's MCP server lets your AI pair programmer read, write, and complete tasks in your backlog autonomously.",
    },
    {
      question: "How does Discord account linking work?",
      answer: "Under your settings, you can generate a unique linking code. Typing /todo link [code] in your Discord server maps your Discord user account securely to your Todo Flow database records.",
    },
    {
      question: "Is my task data private and secure?",
      answer: "Yes. All authentication is managed via Clerk, ensuring top-tier OAuth and session security. Your task data is stored securely in your private user profile, accessible only to your authenticated sessions, bot links, and custom MCP tokens.",
    },
    {
      question: "Can I self-host the entire system?",
      answer: "Todo Flow is built as a modular monorepo. You can easily clone the repository, spin up the Next.js app on Vercel or your own Node environment, configure your Discord bot application tokens, and self-host the database.",
    },
  ];

  return (
    <section id="faq" className="relative px-6 py-32 border-t border-white/5 z-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/5 bg-zinc-950/10 backdrop-blur-md overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-zinc-200 hover:text-white transition-colors"
                >
                  <span className="font-semibold text-sm">{faq.question}</span>
                  <span className="text-xs text-zinc-500 font-mono transition-transform duration-300 ml-4">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/2 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SelfHostSection() {
  return (
    <section id="self-host" className="relative px-6 py-32 border-t border-white/5 z-10">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300 mb-6 tracking-wide uppercase">
          Developer First
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight mb-6">
          100% Free & Open Source
        </h2>
        <p className="mx-auto max-w-2xl text-zinc-400 mb-10 text-sm leading-relaxed">
          No credit cards, no premium paywalls, and no telemetry. Run it on our hosting, or deploy it privately to your own server in under 5 minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/lazyshrey/todo-flow-app"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-zinc-200 hover:bg-white/10 transition-colors"
          >
            Star on GitHub
          </a>
          <a
            href="/docs"
            className="rounded-full bg-white px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            View Integration Docs
          </a>
        </div>
      </div>
    </section>
  );
}
