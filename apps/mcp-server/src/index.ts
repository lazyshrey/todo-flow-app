import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (Local .env -> Monorepo root .env)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const token = process.env.TODO_MCP_TOKEN;
const apiUrl = process.env.API_URL || 'http://localhost:3000/api/mcp';

if (!token) {
  console.error("TODO_MCP_TOKEN environment variable is required.");
  process.exit(1);
}

const server = new Server(
  {
    name: "todo-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper to check format of notes
function getNotesFormat(notesText: string | undefined | null): "text" | "checklist" {
  if (!notesText) return "text";
  const trimmed = notesText.trim();
  if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("- [X]")) {
    return "checklist";
  }
  return "text";
}

interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

// Helper to parse sub-todos
function parseSubTodos(notesText: string | undefined | null): SubTodo[] {
  if (!notesText) return [];
  const lines = notesText.split("\n");
  const list: SubTodo[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^-\s+\[([ xX])\]\s+(.*)$/);
    if (match) {
      list.push({
        id: `${index}-${Date.now()}-${Math.random()}`,
        completed: match[1].toLowerCase() === "x",
        text: match[2].trim(),
      });
    }
  });
  return list;
}

// Helper to make API calls to Next.js using the user's custom token
async function callApi(action: string, extraData: any = {}) {
  try {
    const response = await axios.post(
      apiUrl,
      { action, ...extraData },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`MCP API Call failed (${action}):`, error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || 'API Connection Error');
  }
}

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_todos",
        description: "List all todos (active and completed) for the current user including categories, shortened IDs, and checklists.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_todo",
        description: "Create a new todo task with optional category tag and text or checklist format.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title/name of the todo task.",
            },
            notes: {
              type: "string",
              description: "Optional detailed markdown notes/description (used for text mode).",
            },
            tag: {
              type: "string",
              description: "Optional category/tag (e.g. Work, Personal, Shopping). Defaults to 'Inbox'.",
            },
            format: {
              type: "string",
              enum: ["text", "checklist"],
              description: "Task format: 'text' (notes paragraph) or 'checklist' (sub-todos list). Defaults to 'text'.",
            },
            checklist: {
              type: "array",
              items: { type: "string" },
              description: "Optional array of checklist items (only applicable if format is 'checklist').",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "complete_todo",
        description: "Mark a specific todo as completed by its ID (full UUID or 8-character shortened ID).",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique ID (UUID or 8-character shortened ID) of the todo task to complete.",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_todo",
        description: "Delete a specific todo by its ID (full UUID or 8-character shortened ID).",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique ID (UUID or 8-character shortened ID) of the todo task to delete.",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "edit_todo",
        description: "Edit an existing todo's title, description, category tag, or checklist.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique ID (UUID or 8-character shortened ID) of the todo task to edit.",
            },
            title: {
              type: "string",
              description: "The new title for the todo task.",
            },
            notes: {
              type: "string",
              description: "The new notes/description (for text mode).",
            },
            tag: {
              type: "string",
              description: "The new category/tag name.",
            },
            format: {
              type: "string",
              enum: ["text", "checklist"],
              description: "Task format: 'text' or 'checklist'.",
            },
            checklist: {
              type: "array",
              items: { type: "string" },
              description: "New array of checklist items (only if format is 'checklist').",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_todos") {
      const res = await callApi("list");
      const todos = res.todos || [];
      if (todos.length === 0) {
        return {
          content: [{ type: "text", text: "You don't have any todos!" }],
        };
      }
      const formatted = todos
        .map((t: any) => {
          const format = getNotesFormat(t.notes);
          const shortId = t.id.substring(0, 8);
          const tag = t.groupName || 'Inbox';
          const status = t.completed ? '✓ Completed' : '☐ Pending';
          
          let notesStr = '';
          if (format === 'checklist') {
            const list = parseSubTodos(t.notes);
            const done = list.filter(item => item.completed).length;
            notesStr = `\n  Checklist: ${done}/${list.length} completed`;
            if (list.length > 0) {
              const itemsList = list.map(item => `    ${item.completed ? '☑️' : '⬜'} ${item.text}`).join('\n');
              notesStr += `\n${itemsList}`;
            }
          } else if (t.notes) {
            notesStr = `\n  Notes: ${t.notes}`;
          }
          
          return `- [${t.completed ? "x" : " "}] **${t.title}** (ID: \`${shortId}\` | Tag: \`${tag}\` | ${status})${notesStr}`;
        })
        .join("\n\n");
      return {
        content: [{ type: "text", text: `Here are your todos:\n\n${formatted}` }],
      };
    }

    if (name === "create_todo") {
      const { title, notes, tag, format, checklist } = args as { 
        title: string; 
        notes?: string; 
        tag?: string; 
        format?: "text" | "checklist"; 
        checklist?: string[] 
      };
      const res = await callApi("create", { title, notes, tag, format, checklist });
      const t = res.todo;
      const tagStr = t.groupName ? ` [Tag: \`${t.groupName}\`]` : '';
      return {
        content: [
          {
            type: "text",
            text: `Successfully created todo: **${t.title}** (ID: \`${t.id.substring(0, 8)}\`${tagStr})`,
          },
        ],
      };
    }

    if (name === "complete_todo") {
      const { id } = args as { id: string };
      const res = await callApi("complete", { id });
      const t = res.todo;
      return {
        content: [{ type: "text", text: `Marked todo **${t.title}** (\`${t.id.substring(0, 8)}\`) as completed.` }],
      };
    }

    if (name === "delete_todo") {
      const { id } = args as { id: string };
      await callApi("delete", { id });
      return {
        content: [{ type: "text", text: `Deleted todo with ID \`${id}\`.` }],
      };
    }

    if (name === "edit_todo") {
      const { id, title, notes, tag, format, checklist } = args as { 
        id: string; 
        title?: string; 
        notes?: string; 
        tag?: string; 
        format?: "text" | "checklist"; 
        checklist?: string[] 
      };
      const res = await callApi("edit", { id, title, notes, tag, format, checklist });
      const t = res.todo;
      const tagStr = t.groupName ? ` [Tag: \`${t.groupName}\`]` : '';
      return {
        content: [
          {
            type: "text",
            text: `Successfully edited todo: **${t.title}** (ID: \`${t.id.substring(0, 8)}\`${tagStr})`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing tool: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todo MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
