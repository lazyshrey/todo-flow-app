import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';

// Helper to resolve potentially shortened 8-character ID
function resolveTodoId(userId: string, id: string): string | null {
  if (id && id.length === 8) {
    const todos = db.todos.getByUser(userId);
    const match = todos.find((t: any) => t.id.substring(0, 8) === id || t.id.startsWith(id));
    return match ? match.id : null;
  }
  return id;
}

// Helper to validate the MCP User token
function getUserIdFromToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const tokenRecord = db.mcpTokens.get(token);
  if (!tokenRecord) {
    return null;
  }
  return tokenRecord.userId;
}

export async function POST(req: Request) {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: Invalid MCP token' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // Action: list all todos (active & completed)
    if (action === 'list') {
      const userTodos = db.todos.getByUser(userId);
      return NextResponse.json({ todos: userTodos });
    }

    // Action: create a new todo
    if (action === 'create') {
      const { title, notes, tag, format, checklist } = body;
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const normalizedGroup = db.todos.normalizeGroupName(userId, tag);

      let finalNotes = notes ? notes.trim() : '';
      if (format === 'checklist' && Array.isArray(checklist)) {
        finalNotes = checklist.map(item => `- [ ] ${item.trim()}`).join('\n');
      }

      const newTodo = {
        id: crypto.randomUUID(),
        userId,
        title: title.trim(),
        notes: finalNotes,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        groupName: normalizedGroup
      };

      db.todos.set(newTodo.id, newTodo);
      return NextResponse.json({ todo: newTodo }, { status: 201 });
    }

    // Action: complete a todo
    if (action === 'complete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      const resolvedId = resolveTodoId(userId, id);
      if (!resolvedId) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      const todo = db.todos.get(resolvedId);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (todo.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      todo.completed = true;
      todo.updatedAt = Date.now();
      db.todos.set(resolvedId, todo);

      return NextResponse.json({ success: true, todo });
    }

    // Action: edit a todo
    if (action === 'edit') {
      const { id, title, notes, tag, format, checklist } = body;
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      const resolvedId = resolveTodoId(userId, id);
      if (!resolvedId) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      const todo = db.todos.get(resolvedId);
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

      if (format === 'checklist' && Array.isArray(checklist)) {
        todo.notes = checklist.map(item => `- [ ] ${item.trim()}`).join('\n');
      } else if (notes !== undefined) {
        todo.notes = notes.trim();
      }

      if (tag !== undefined) {
        todo.groupName = db.todos.normalizeGroupName(userId, tag);
      }

      todo.updatedAt = Date.now();
      db.todos.set(resolvedId, todo);

      return NextResponse.json({ success: true, todo });
    }

    // Action: delete a todo
    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      const resolvedId = resolveTodoId(userId, id);
      if (!resolvedId) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      const todo = db.todos.get(resolvedId);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (todo.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      db.todos.delete(resolvedId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('MCP API handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
