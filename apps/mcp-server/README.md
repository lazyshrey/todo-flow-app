# todo-flow-mcp

Model Context Protocol (MCP) server for **Todo Flow**, enabling AI agents (like Claude Desktop, Claude Code, Antigravity, or Codex) to securely read, create, edit, and complete todos directly from your workspace.

Runs over a standard stdio transport and communicates with the Todo Flow web server.

---

## 🚀 Installation & Usage

You can use the package instantly with `npx` (recommended) or install it globally.

### Option 1: Run via `npx` (No Install Required)
You can invoke the server directly using `npx`:
```bash
npx todo-flow-mcp
```

### Option 2: Global Installation
```bash
npm install -g todo-flow-mcp
```
Once installed globally, you can start it with:
```bash
todo-flow-mcp
```

---

## ⚙️ Configuration & Environment Variables

The server requires the following environment variables to authenticate with your Todo Flow backend database:

| Environment Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `TODO_MCP_TOKEN` | Your custom API token generated in the Web Settings dashboard. | **Yes** | None |
| `API_URL` | The endpoint URL of your deployed Todo Flow instance. | No | `http://localhost:3000/api/mcp` |

---

## 🛠️ Integration Guides

### 1. Claude Desktop Config
To integrate this server with **Claude Desktop**, open your desktop configuration file:
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following config block inside the `mcpServers` object:

```json
{
  "mcpServers": {
    "todo-flow": {
      "command": "npx",
      "args": ["-y", "todo-flow-mcp"],
      "env": {
        "TODO_MCP_TOKEN": "YOUR_MCP_TOKEN_HERE",
        "API_URL": "https://your-todo-flow-domain.com/api/mcp"
      }
    }
  }
}
```

### 2. Claude Code or Antigravity Config
In agents or CLI tools supporting MCP, add the server to your settings configuration:
* **Command**: `npx`
* **Args**: `["-y", "todo-flow-mcp"]`
* **Environment variables**:
  - `TODO_MCP_TOKEN` = `your_token`
  - `API_URL` = `https://your-todo-flow-domain.com/api/mcp`

---

## 🗃️ Exposed Tools

Once connected, your AI assistant will have access to the following **5 tools**:

### 1. `list_todos`
List all active and completed todos, showing category tags, completion status, 8-character shortened IDs, and checklists.
* **Arguments**: None (`{}`)

### 2. `create_todo`
Create a new todo task.
* **Required Parameters**:
  - `title` (string): The title/name of the todo task.
* **Optional Parameters**:
  - `notes` (string): Description notes.
  - `tag` (string): Category tag (e.g., `Work`, `Personal`). Defaults to `Inbox`.
  - `format` (string): `"text"` or `"checklist"`. Defaults to `"text"`.
  - `checklist` (array of strings): Sub-todo checklist items (used if format is `"checklist"`).

### 3. `complete_todo`
Mark a specific todo task as completed.
* **Required Parameters**:
  - `id` (string): The unique ID of the todo task (supports full UUID or the 8-character shortened ID).

### 4. `delete_todo`
Permanently delete a todo task.
* **Required Parameters**:
  - `id` (string): The unique ID of the todo task (supports full UUID or the 8-character shortened ID).

### 5. `edit_todo`
Update an existing todo's properties (title, notes, tag, or checklist items).
* **Required Parameters**:
  - `id` (string): The unique ID of the todo task.
* **Optional Parameters**:
  - `title` (string), `notes` (string), `tag` (string), `format` (string), `checklist` (array of strings).

---

## 🧪 Development & Testing Local MCP
If you are developing locally, you can run:
```bash
# Clone the repository and navigate to the mcp-server package
cd apps/mcp-server

# Build the project
npm run build

# Start the server locally
node dist/index.js
```
