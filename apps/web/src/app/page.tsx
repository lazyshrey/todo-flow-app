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
} from "lucide-react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import SideRays from "@/components/SideRays";



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
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-zinc-100 sm:text-3xl tracking-tight mb-3">
              A Unified Developer Ecosystem
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400 text-sm">
              Manage and sync tasks seamlessly across the web dashboard, Discord server, and AI developer agents.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="w-full relative rounded-2xl border border-white/10 bg-zinc-950/40 p-2 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden group hover:border-white/20 transition-all duration-500"
            >
              {/* Window header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50 rounded-t-xl text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500/40 transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/40 transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500/40 transition-colors" />
                </div>
                <div className="font-mono text-[10px] tracking-wider text-zinc-400">Todo Flow Ecosystem Overview</div>
                <div className="w-12"></div>
              </div>
              {/* Window content (image) */}
              <div className="overflow-hidden rounded-b-xl bg-zinc-950/60">
                <img 
                  src="/screenshot.png" 
                  alt="Todo Flow Ecosystem" 
                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          </div>
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
              One source of todo, everywhere
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
                <h2 className="mb-4 text-2xl font-extrabold text-zinc-100 sm:text-3xl tracking-tight">
                  Built for developers
                </h2>
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

              <div className="relative rounded-2xl border border-white/10 bg-zinc-950/40 p-2 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50 rounded-t-xl text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500/40 transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/40 transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500/40 transition-colors" />
                  </div>
                  <div className="font-mono text-[10px] tracking-wider text-zinc-400">Discord Bot Commands</div>
                  <div className="w-12"></div>
                </div>
                {/* Window content (image) */}
                <div className="overflow-hidden rounded-b-xl bg-zinc-950/60">
                  <img 
                    src="/developer_screenshot.png" 
                    alt="Discord Bot Commands Interface" 
                    className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
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
          <p>
            Built by{" "}
            <a 
              href="https://github.com/lazyshrey" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-400 hover:text-white underline transition-colors"
            >
              Shrey
            </a>{" "}
            • Check out{" "}
            <a 
              href="https://lazyshrey.in" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-400 hover:text-white underline transition-colors"
            >
              lazyshrey.in
            </a>
          </p>
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
        <div className="flex flex-wrap justify-center items-center gap-4">
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
          <a
            href="https://discord.gg/ZVCB8EnRX2"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] px-6 py-3 text-xs font-bold text-white transition-all duration-300 cursor-pointer active:scale-95 shadow-lg shadow-[#5865F2]/15 hover:shadow-[#5865F2]/25"
          >
            <svg 
              className="h-3.5 w-3.5 fill-current" 
              viewBox="0 0 127.14 96.36" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A51.31,51.31,0,0,0,31.2,76.58a74.37,74.37,0,0,0,64.74,0,51.31,51.31,0,0,0,3.07,4a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.5,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            Join Discord
          </a>
        </div>
      </div>
    </section>
  );
}
