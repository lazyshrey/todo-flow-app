"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Terminal,
  Link2,
  Unlink,
  Plus,
  Trash2,
  Copy,
  Check,
  Key,
} from "lucide-react";
import Header from "@/components/Header";
import { useTheme } from "@/lib/useTheme";
import { copyTextToClipboard } from "@/components/dashboard/helpers";

interface McpToken {
  name: string;
  createdAt: number;
  maskedToken: string;
  id: string;
}

interface DiscordStatus {
  discordId: string | null;
}

export default function SettingsPage() {
  const { theme, changeTheme } = useTheme();
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [linkCode, setLinkCode] = useState("");
  const [linkMessage, setLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tokens, setTokens] = useState<McpToken[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDiscordStatus = async () => {
    try {
      const res = await fetch("/api/auth/link");
      if (res.ok) {
        const data = await res.json();
        setDiscordStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Discord status:", error);
    } finally {
      setLoading(false);
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
    fetchDiscordStatus();
    fetchTokens();
  }, []);

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
      const res = await fetch("/api/auth/link", {
        method: "DELETE",
      });
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

  const deleteToken = async (token: string) => {
    try {
      const res = await fetch("/api/mcp/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setTokens(tokens.filter((t) => t.id !== token));
      }
    } catch (error) {
      console.error("Failed to delete token:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    copyTextToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="mb-2 text-3xl font-bold text-zinc-100">Settings</h1>
          <p className="mb-8 text-zinc-400">
            Manage appearance, integrations, and authentication tokens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-zinc-300"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Appearance
              </h2>
              <p className="text-sm text-zinc-400">
                Customize the application interface color scheme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["dark", "light", "gray"] as const).map((t) => (
              <button
                key={t}
                onClick={() => changeTheme(t)}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs md:text-sm font-semibold capitalize ${
                  theme === t
                    ? "bg-white text-zinc-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)] font-bold scale-[1.02]"
                    : "bg-white/[0.02] text-zinc-300 border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                }`}
              >
                {t === "gray" ? "Discord Gray" : t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <MessageSquare className="h-5 w-5 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Discord Integration
                </h2>
                <p className="text-sm text-zinc-400">
                  Link your Discord account to manage tasks from Discord
                </p>
              </div>
            </div>
            <a
              href="https://discord.gg/ZVCB8EnRX2"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 self-start sm:self-center rounded-lg bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 text-xs font-semibold text-white transition-all duration-300 cursor-pointer active:scale-95 shadow-md shadow-[#5865F2]/10 hover:shadow-[#5865F2]/20"
            >
              <svg 
                className="h-3.5 w-3.5 fill-current" 
                viewBox="0 0 127.14 96.36" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A51.31,51.31,0,0,0,31.2,76.58a74.37,74.37,0,0,0,64.74,0,51.31,51.31,0,0,0,3.07,4a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.5,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              Join Lazy Devs Discord
            </a>
          </div>

          {discordStatus?.discordId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                <Check className="h-5 w-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-400">
                    Discord account linked
                  </p>
                  <p className="text-xs text-zinc-500">
                    ID: {discordStatus.discordId}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-sm text-zinc-300">
                  Available commands in Discord:
                </p>
                <div className="space-y-2 font-mono text-xs text-zinc-400">
                  <div>
                    <span className="text-emerald-400">/todo add</span> "task
                    title" - Create a new task
                  </div>
                  <div>
                    <span className="text-emerald-400">/todo list</span> - View
                    active tasks
                  </div>
                  <div>
                    <span className="text-emerald-400">/todo complete</span>{" "}
                    [id] - Mark task as done
                  </div>
                </div>
              </div>

              <button
                onClick={unlinkDiscord}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-white/10 transition-colors"
              >
                <Unlink className="h-4 w-4" />
                Unlink Discord Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-sm text-zinc-300">
                  To link your Discord account:
                </p>
                <ol className="space-y-2 text-sm text-zinc-400">
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                      1
                    </span>
                    Type <code className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-zinc-300">/todo link</code> in Discord
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                      2
                    </span>
                    Copy the 6-digit code provided by the bot
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                      3
                    </span>
                    Enter the code below and click Link
                  </li>
                </ol>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setLinkCode(value);
                    setLinkMessage(null);
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/20 transition-colors font-mono tracking-widest"
                />
                <button
                  onClick={linkDiscord}
                  disabled={linkCode.length !== 6}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  Link
                </button>
              </div>

              <AnimatePresence>
                {linkMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-lg px-4 py-3 text-sm ${
                      linkMessage.type === "success"
                        ? "border border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                        : "border border-red-400/20 bg-red-400/5 text-red-400"
                    }`}
                  >
                    {linkMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Terminal className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                MCP Tokens
              </h2>
              <p className="text-sm text-zinc-400">
                Generate tokens for AI assistants like Cursor and Claude. 
                Read the <a href="/docs" className="text-white underline hover:text-zinc-350">integration docs</a> or see <a href="https://www.npmjs.com/package/todo-flow-mcp" target="_blank" rel="noreferrer" className="text-white underline hover:text-zinc-350 font-bold">npm</a>.
              </p>
            </div>
          </div>

          {generatedToken && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4"
            >
              <p className="mb-2 text-sm font-medium text-emerald-400">
                Token generated successfully!
              </p>
              <p className="mb-3 text-xs text-zinc-400">
                Copy this token now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-zinc-950/80 px-4 py-2.5 text-xs font-mono text-zinc-300 break-all select-all">
                  {generatedToken}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedToken)}
                  className="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 p-2.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Quick config helper */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-zinc-400 select-text font-mono">
                <p className="text-[10px] font-bold text-zinc-200 select-none">Quick Integration (Claude Desktop Config):</p>
                <pre className="bg-zinc-950 p-2.5 rounded-lg border border-white/10 overflow-x-auto text-[10px] text-zinc-300">
{`{
  "mcpServers": {
    "todo-flow": {
      "command": "npx",
      "args": ["-y", "todo-flow-mcp"],
      "env": {
        "TODO_MCP_TOKEN": "${generatedToken}",
        "API_URL": "${typeof window !== "undefined" ? window.location.origin : "https://todo.jene.in"}/api/mcp"
      }
    }
  }
}`}
                </pre>
                <p className="text-[10px] text-zinc-500 select-none">
                  Paste this into your configuration file. For other tools like Cursor, see the <a href="/docs" className="text-zinc-300 underline hover:text-white font-semibold">Docs</a>.
                </p>
              </div>
            </motion.div>
          )}

          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateToken()}
              placeholder="Token name (e.g., Cursor, Claude)"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={generateToken}
              disabled={!newTokenName.trim()}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              Generate
            </button>
          </div>

          {tokens.length === 0 ? (
            <div className="py-12 text-center">
              <Key className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">
                No tokens generated yet. Create one to get started with AI
                assistants.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <Key className="h-4 w-4 text-zinc-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">
                      {token.name}
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      {token.maskedToken}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteToken(token.id)}
                    className="rounded-lg p-2 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
