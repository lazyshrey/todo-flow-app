import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file location
const baseDir = process.cwd().includes('apps/web') ? process.cwd() : path.join(process.cwd(), 'apps/web');
const dbDir = path.join(baseDir, 'database');
const dbPath = path.join(dbDir, 'todo.db');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Prevent opening multiple database connections during Next.js hot reloads in development
const globalWithSqlite = globalThis as any;
if (!globalWithSqlite._sqliteInstance) {
  globalWithSqlite._sqliteInstance = new Database(dbPath);
  globalWithSqlite._sqliteInstance.pragma('journal_mode = WAL');
  globalWithSqlite._sqliteInstance.pragma('foreign_keys = ON');
}
const sqlite = globalWithSqlite._sqliteInstance;

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    completed INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    due_date INTEGER,
    priority TEXT,
    group_name TEXT DEFAULT 'Inbox'
  );

  CREATE TABLE IF NOT EXISTS users (
    clerk_id TEXT PRIMARY KEY,
    discord_id TEXT,
    discord_username TEXT
  );

  CREATE TABLE IF NOT EXISTS discord_mappings (
    discord_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(clerk_id)
  );

  CREATE TABLE IF NOT EXISTS mcp_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(clerk_id)
  );

  CREATE TABLE IF NOT EXISTS link_codes (
    code TEXT PRIMARY KEY,
    discord_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    discord_username TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
  CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
  CREATE INDEX IF NOT EXISTS idx_link_codes_expires ON link_codes(expires_at);
`);

// Migrate existing database to add group_name column if it doesn't exist
try {
  sqlite.exec(`ALTER TABLE todos ADD COLUMN group_name TEXT DEFAULT 'Inbox'`);
} catch (e) {
  // Column already exists, ignore
}

try {
  sqlite.exec(`ALTER TABLE users ADD COLUMN discord_username TEXT`);
} catch (e) {}

try {
  sqlite.exec(`ALTER TABLE link_codes ADD COLUMN discord_username TEXT`);
} catch (e) {}

// Prepared statements for better performance
const stmts = {
  // Todos
  getTodo: sqlite.prepare('SELECT * FROM todos WHERE id = ?'),
  getTodosByUser: sqlite.prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'),
  getActiveTodosByUser: sqlite.prepare('SELECT * FROM todos WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC'),
  insertTodo: sqlite.prepare('INSERT INTO todos (id, user_id, title, notes, completed, created_at, updated_at, due_date, priority, group_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'),
  updateTodo: sqlite.prepare('UPDATE todos SET title = ?, notes = ?, completed = ?, updated_at = ?, due_date = ?, priority = ?, group_name = ? WHERE id = ?'),
  deleteTodo: sqlite.prepare('DELETE FROM todos WHERE id = ?'),

  // Users
  getUser: sqlite.prepare('SELECT * FROM users WHERE clerk_id = ?'),
  insertUser: sqlite.prepare('INSERT OR REPLACE INTO users (clerk_id, discord_id, discord_username) VALUES (?, ?, ?)'),
  updateUserDiscord: sqlite.prepare('UPDATE users SET discord_id = ?, discord_username = ? WHERE clerk_id = ?'),

  // Discord mappings
  getDiscordMapping: sqlite.prepare('SELECT * FROM discord_mappings WHERE discord_id = ?'),
  insertDiscordMapping: sqlite.prepare('INSERT OR REPLACE INTO discord_mappings (discord_id, user_id) VALUES (?, ?)'),
  deleteDiscordMapping: sqlite.prepare('DELETE FROM discord_mappings WHERE discord_id = ?'),

  // MCP tokens
  getMcpToken: sqlite.prepare('SELECT * FROM mcp_tokens WHERE token = ?'),
  getMcpTokensByUser: sqlite.prepare('SELECT * FROM mcp_tokens WHERE user_id = ?'),
  insertMcpToken: sqlite.prepare('INSERT INTO mcp_tokens (token, user_id, name, created_at) VALUES (?, ?, ?, ?)'),
  deleteMcpToken: sqlite.prepare('DELETE FROM mcp_tokens WHERE token = ?'),

  // Link codes
  getLinkCode: sqlite.prepare('SELECT * FROM link_codes WHERE code = ?'),
  insertLinkCode: sqlite.prepare('INSERT INTO link_codes (code, discord_id, expires_at, discord_username) VALUES (?, ?, ?, ?)'),
  deleteLinkCode: sqlite.prepare('DELETE FROM link_codes WHERE code = ?'),
  deleteExpiredLinkCodes: sqlite.prepare('DELETE FROM link_codes WHERE expires_at < ?'),
};

// Helper functions to convert between database rows and objects
function rowToTodo(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    notes: row.notes || '',
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueDate: row.due_date || null,
    priority: row.priority || 'Medium',
    groupName: row.group_name || 'Inbox',
  };
}

function rowToUser(row: any): any {
  if (!row) return null;
  return {
    clerkId: row.clerk_id,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
    mcpTokens: [], // Will be populated separately if needed
  };
}

// Database API (similar to Enmap interface)
export const db = {
  todos: {
    get(id: string) {
      return rowToTodo(stmts.getTodo.get(id));
    },
    set(id: string, todo: any) {
      const existing = stmts.getTodo.get(id);
      if (existing) {
        stmts.updateTodo.run(
          todo.title,
          todo.notes || '',
          todo.completed ? 1 : 0,
          todo.updatedAt,
          todo.dueDate || null,
          todo.priority || 'Medium',
          todo.groupName || 'Inbox',
          id
        );
      } else {
        stmts.insertTodo.run(
          id,
          todo.userId,
          todo.title,
          todo.notes || '',
          todo.completed ? 1 : 0,
          todo.createdAt,
          todo.updatedAt,
          todo.dueDate || null,
          todo.priority || 'Medium',
          todo.groupName || 'Inbox'
        );
      }
    },
    delete(id: string) {
      stmts.deleteTodo.run(id);
    },
    values() {
      const allTodos = sqlite.prepare('SELECT * FROM todos').all();
      return allTodos.map(rowToTodo);
    },
    getByUser(userId: string) {
      return stmts.getTodosByUser.all(userId).map(rowToTodo);
    },
    getActiveByUser(userId: string) {
      return stmts.getActiveTodosByUser.all(userId).map(rowToTodo);
    },
    normalizeGroupName(userId: string, groupName: string | undefined | null): string {
      if (!groupName) return 'Inbox';
      const trimmed = groupName.trim();
      if (!trimmed) return 'Inbox';
      
      const defaultGroups = ['Inbox', 'Work', 'Personal'];
      for (const g of defaultGroups) {
        if (g.toLowerCase() === trimmed.toLowerCase()) {
          return g;
        }
      }
      
      const userTodos = stmts.getTodosByUser.all(userId) as any[];
      for (const row of userTodos) {
        const existingGroup = row.group_name || 'Inbox';
        if (existingGroup.toLowerCase() === trimmed.toLowerCase()) {
          return existingGroup;
        }
      }
      
      return trimmed;
    },
  },

  users: {
    get(clerkId: string) {
      return rowToUser(stmts.getUser.get(clerkId));
    },
    set(clerkId: string, user: any) {
      stmts.insertUser.run(clerkId, user.discordId || null, user.discordUsername || null);
    },
    updateDiscordId(clerkId: string, discordId: string | null, discordUsername: string | null = null) {
      const existing = stmts.getUser.get(clerkId);
      if (!existing) {
        stmts.insertUser.run(clerkId, discordId, discordUsername);
      } else {
        stmts.updateUserDiscord.run(discordId, discordUsername, clerkId);
      }
    },
  },

  discordMappings: {
    get(discordId: string) {
      const row = stmts.getDiscordMapping.get(discordId) as any;
      return row ? { userId: row.user_id } : null;
    },
    set(discordId: string, mapping: { userId: string }) {
      stmts.insertDiscordMapping.run(discordId, mapping.userId);
    },
    delete(discordId: string) {
      stmts.deleteDiscordMapping.run(discordId);
    },
  },

  mcpTokens: {
    get(token: string) {
      const row = stmts.getMcpToken.get(token) as any;
      return row ? { userId: row.user_id, name: row.name, createdAt: row.created_at } : null;
    },
    set(token: string, record: { userId: string; name: string; createdAt: number }) {
      stmts.insertMcpToken.run(token, record.userId, record.name, record.createdAt);
    },
    delete(token: string) {
      stmts.deleteMcpToken.run(token);
    },
    getByUser(userId: string) {
      return stmts.getMcpTokensByUser.all(userId).map((row: any) => ({
        token: row.token,
        name: row.name,
        createdAt: row.created_at,
      }));
    },
  },

  linkCodes: {
    get(code: string) {
      const row = stmts.getLinkCode.get(code) as any;
      return row ? { discordId: row.discord_id, expiresAt: row.expires_at, discordUsername: row.discord_username } : null;
    },
    set(code: string, record: { discordId: string; expiresAt: number; discordUsername?: string | null }) {
      stmts.insertLinkCode.run(code, record.discordId, record.expiresAt, record.discordUsername || null);
    },
    delete(code: string) {
      stmts.deleteLinkCode.run(code);
    },
    deleteExpired() {
      stmts.deleteExpiredLinkCodes.run(Date.now());
    },
  },
};

// Graceful shutdown
process.on('exit', () => {
  sqlite.close();
});
