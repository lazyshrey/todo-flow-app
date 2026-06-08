import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';

// Helper to validate the internal bot secret
function isValidSecret(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const expectedSecret = process.env.DISCORD_BOT_SECRET;
  
  if (!expectedSecret) {
    console.error('DISCORD_BOT_SECRET env variable is not set!');
    return false;
  }
  
  return authHeader === `Bearer ${expectedSecret}`;
}

export async function POST(req: Request) {
  if (!isValidSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, discordId } = body;

    if (!action || !discordId) {
      return NextResponse.json({ error: 'Missing action or discordId' }, { status: 400 });
    }

    // Handle account linking code generation
    if (action === 'generate_link_code') {
      // Clean up expired link codes first
      db.linkCodes.deleteExpired();

      // Generate a new 6-digit code
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10).toString();
      }

      const { username } = body;
      db.linkCodes.set(code, {
        discordId,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
        discordUsername: username || null
      });

      return NextResponse.json({ code });
    }

    // Handle account unlinking
    if (action === 'unlink_account') {
      const mapping = db.discordMappings.get(discordId);
      if (mapping) {
        db.users.updateDiscordId(mapping.userId, null);
      }
      db.discordMappings.delete(discordId);
      return NextResponse.json({ success: true });
    }

    // For all other actions, resolve the Discord User ID to a Clerk User ID
    const mapping = db.discordMappings.get(discordId);
    if (!mapping) {
      return NextResponse.json({ error: 'NOT_LINKED' }, { status: 200 });
    }
    const userId = mapping.userId;

    // Update Discord username in database if provided
    const { username } = body;
    if (username) {
      const userConfig = db.users.get(userId);
      if (userConfig && userConfig.discordUsername !== username) {
        userConfig.discordUsername = username;
        db.users.set(userId, userConfig);
      }
    }

    // Action: list active todos
    if (action === 'get_todos') {
      const activeTodos = db.todos.getActiveByUser(userId);
      return NextResponse.json({ todos: activeTodos });
    }

    // Action: create a new todo
    if (action === 'create_todo') {
      const { title, notes, priority, groupName, dueDate } = body;
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      if (dueDate !== undefined && dueDate !== null) {
        const parsedDate = new Date(dueDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate.getTime() < today.getTime()) {
          return NextResponse.json({ error: 'Due date cannot be in the past' }, { status: 400 });
        }
      }

      const normalizedGroup = db.todos.normalizeGroupName(userId, groupName);

      const newTodo = {
        id: crypto.randomUUID(),
        userId,
        title: title.trim(),
        notes: notes ? notes.trim() : '',
        priority: priority || 'Medium',
        groupName: normalizedGroup,
        dueDate: dueDate || null,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      db.todos.set(newTodo.id, newTodo);
      return NextResponse.json({ todo: newTodo });
    }

    // Action: mark a todo completed
    if (action === 'complete_todo') {
      const { todoId } = body;
      if (!todoId) {
        return NextResponse.json({ error: 'todoId is required' }, { status: 400 });
      }

      const todo = db.todos.get(todoId);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (todo.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      todo.completed = true;
      todo.updatedAt = Date.now();
      db.todos.set(todoId, todo);

      return NextResponse.json({ success: true, todo });
    }

    // Action: delete a todo
    if (action === 'delete_todo') {
      const { todoId } = body;
      if (!todoId) {
        return NextResponse.json({ error: 'todoId is required' }, { status: 400 });
      }

      const todo = db.todos.get(todoId);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (todo.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      db.todos.delete(todoId);
      return NextResponse.json({ success: true });
    }

    if (action === 'edit_todo') {
      const { todoId, title, notes, groupName, dueDate } = body;
      if (!todoId) {
        return NextResponse.json({ error: 'todoId is required' }, { status: 400 });
      }

      if (dueDate !== undefined && dueDate !== null) {
        const parsedDate = new Date(dueDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate.getTime() < today.getTime()) {
          return NextResponse.json({ error: 'Due date cannot be in the past' }, { status: 400 });
        }
      }

      const todo = db.todos.get(todoId);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (todo.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }
        todo.title = title.trim();
      }
      if (notes !== undefined) {
        todo.notes = notes.trim();
      }
      if (groupName !== undefined) {
        todo.groupName = db.todos.normalizeGroupName(userId, groupName);
      }
      if (dueDate !== undefined) {
        todo.dueDate = dueDate;
      }
      todo.updatedAt = Date.now();
      db.todos.set(todoId, todo);

      return NextResponse.json({ success: true, todo });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Discord API handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
