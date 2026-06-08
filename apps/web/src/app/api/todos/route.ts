import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/database';
import crypto from 'crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userTodos = db.todos.getByUser(userId);
  return NextResponse.json(userTodos);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, notes, dueDate, priority, groupName } = await req.json();
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
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      groupName: normalizedGroup
    };

    db.todos.set(newTodo.id, newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
