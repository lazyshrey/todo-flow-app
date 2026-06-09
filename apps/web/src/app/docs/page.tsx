"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Key,
  Copy,
  Check,
  Cpu,
  BookOpen,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import { copyTextToClipboard } from "@/components/dashboard/helpers";

export default function DocsPage() {
  const [userToken, setUserToken] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const displayToken = userToken.trim() || "YOUR_MCP_TOKEN_HERE";

  const handleCopy = (text: string, sectionId: string) => {
    copyTextToClipboard(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sseConfig = `{
  "mcpServers": {
    "todo-flow": {
      "type": "sse",
      "url": "https://todo-mcp.jene.in/sse"
    }
  }
}`;

  const stdioConfig = `{
  "mcpServers": {
    "todo-flow": {
      "command": "npx",
      "args": ["-y", "todo-flow-mcp"],
      "env": {
        "TODO_MCP_TOKEN": "${displayToken}",
        "API_URL": "https://todo.jene.in/api/mcp"
      }
    }
  }
}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-zinc-950 text-zinc-100 relative pb-20">
        {/* Background Dot Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,#000_50%,transparent_100%)] pointer-events-none z-0" />

        <div className="mx-auto max-w-4xl px-6 pt-12 relative z-10">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center sm:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300 mb-4 tracking-wide">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Developer Documentation</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3 sm:text-5xl">
              Model Context Protocol (MCP) Setup
            </h1>
            <p className="max-w-2xl text-md text-zinc-400 leading-relaxed font-normal">
              Connect your Todo Flow backlog directly to AI pair programmers (like Claude Desktop, Cursor, Claude Code, and Antigravity) using the custom MCP server.
            </p>
            
            {/* NPM Package Link Button */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
              <a
                href="https://www.npmjs.com/package/todo-flow-mcp"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-md"
              >
                <span>npm package: <code className="text-white font-mono">todo-flow-mcp</code></span>
                <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </motion.div>

          {/* Interactive Token Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                <Key className="h-5 w-5 text-zinc-300" />
              </div>
              <div className="flex-1 space-y-1 w-full">
                <h3 className="text-sm font-bold text-zinc-200">Interactive Setup</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Paste your generated MCP token below to automatically pre-fill the configuration snippets in real-time.
                </p>
                <input
                  type="text"
                  placeholder="Paste your generated mcp token..."
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-550 outline-none focus:border-white/20 transition-all font-mono mt-2"
                />
              </div>
            </div>
          </motion.div>

          {/* Setup Options Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {/* Option A: Hosted SSE */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md p-6 relative group overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-3">
                  <Cpu className="h-5 w-5 text-zinc-300" />
                </div>
                <h3 className="text-md font-bold text-zinc-150 mb-2">Option A: Hosted SSE Mode</h3>
                <p className="text-xs leading-relaxed text-zinc-400 mb-4">
                  Uses the hosted Server-Sent Events (SSE) server live at <code className="text-white">todo-mcp.jene.in</code>. Ideal for zero local overhead and instant remote database sync.
                </p>
              </div>
              <a
                href="#sse"
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                <span>View SSE Setup</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            {/* Option B: Local Stdio */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md p-6 relative group overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-3">
                  <Terminal className="h-5 w-5 text-zinc-300" />
                </div>
                <h3 className="text-md font-bold text-zinc-150 mb-2">Option B: Local Stdio (npx)</h3>
                <p className="text-xs leading-relaxed text-zinc-400 mb-4">
                  Runs a local instance directly inside your workspace via Node's `npx` runner. Ideal for private environments and custom network proxies.
                </p>
              </div>
              <a
                href="#stdio"
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                <span>View Stdio Setup</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </div>

          {/* Integration Guides Content */}
          <div className="space-y-12">
            {/* Guide 1: Claude Desktop */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="border-t border-white/5 pt-10 space-y-6"
            >
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 select-none">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-semibold">1</span>
                <span>Claude Desktop Integration</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Open your Claude Desktop configuration file:
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono select-all">
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl">
                  <p className="text-zinc-500 font-bold mb-1 select-none">Windows Path:</p>
                  <code className="text-zinc-300 text-[10px] break-all">%APPDATA%\Claude\claude_desktop_config.json</code>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl">
                  <p className="text-zinc-500 font-bold mb-1 select-none">macOS Path:</p>
                  <code className="text-zinc-300 text-[10px] break-all">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                </div>
              </div>

              {/* SSE Guide Block */}
              <div id="sse" className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-bold text-zinc-250">Hosted SSE Configuration (Recommended)</h3>
                  <button
                    onClick={() => handleCopy(sseConfig, "sse")}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-lg transition-all"
                  >
                    {copiedSection === "sse" ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === "sse" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 overflow-x-auto text-[10px] text-zinc-300 font-mono select-all">
                  {sseConfig}
                </pre>
              </div>

              {/* Stdio Guide Block */}
              <div id="stdio" className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-bold text-zinc-250">Local Stdio (npx) Configuration</h3>
                  <button
                    onClick={() => handleCopy(stdioConfig, "stdio")}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-lg transition-all"
                  >
                    {copiedSection === "stdio" ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === "stdio" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 overflow-x-auto text-[10px] text-zinc-300 font-mono select-all">
                  {stdioConfig}
                </pre>
              </div>
            </motion.section>

            {/* Guide 2: Cursor */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="border-t border-white/5 pt-10 space-y-6"
            >
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 select-none">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-semibold">2</span>
                <span>Cursor IDE Integration</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                To link your todo backlog to **Cursor**, add the MCP server configuration inside the settings panel:
              </p>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                <ol className="list-decimal pl-5 text-xs text-zinc-400 space-y-2.5">
                  <li>Navigate to **Cursor Settings** (gear icon in the top-right corner).</li>
                  <li>Go to **Features** -&gt; **MCP**.</li>
                  <li>Click **+ Add New MCP Server**.</li>
                  <li>Enter the following details:</li>
                </ol>

                <div className="grid gap-4 sm:grid-cols-2 font-mono text-[10px] select-all mt-4">
                  <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-lg">
                    <p className="text-zinc-550 font-bold select-none">Name:</p>
                    <code className="text-zinc-300">todo-flow</code>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-lg">
                    <p className="text-zinc-550 font-bold select-none">Type:</p>
                    <code className="text-zinc-300">command</code>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-lg sm:col-span-2">
                    <div className="flex justify-between items-center select-none">
                      <p className="text-zinc-550 font-bold mb-1">Command:</p>
                      <button
                        onClick={() => handleCopy(`npx -y todo-flow-mcp`, "cursor-cmd")}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {copiedSection === "cursor-cmd" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <code className="text-zinc-300">npx -y todo-flow-mcp</code>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <p className="text-xs font-bold text-zinc-350 select-none">Environment Variables (required for token auth):</p>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 justify-between bg-zinc-900/50 border border-white/5 p-3 rounded-lg text-[10px] select-all">
                      <span className="font-mono text-zinc-450"><span className="text-zinc-550">Key:</span> `TODO_MCP_TOKEN` | <span className="text-zinc-550">Value:</span> `{displayToken}`</span>
                      <button
                        onClick={() => handleCopy(displayToken, "cursor-val1")}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {copiedSection === "cursor-val1" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 justify-between bg-zinc-900/50 border border-white/5 p-3 rounded-lg text-[10px] select-all">
                      <span className="font-mono text-zinc-450"><span className="text-zinc-550">Key:</span> `API_URL` | <span className="text-zinc-550">Value:</span> `https://todo.jene.in/api/mcp`</span>
                      <button
                        onClick={() => handleCopy(`https://todo.jene.in/api/mcp`, "cursor-val2")}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {copiedSection === "cursor-val2" ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
}
