import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const todo = db.todos.get(id);

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  if (todo.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { title, notes, completed, dueDate, priority, groupName } = await req.json();

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

    const normalizedGroup = groupName !== undefined ? db.todos.normalizeGroupName(userId, groupName) : todo.groupName;
    const updatedTodo = {
      ...todo,
      title: title !== undefined ? title.trim() : todo.title,
      notes: notes !== undefined ? notes.trim() : todo.notes,
      completed: completed !== undefined ? !!completed : todo.completed,
      dueDate: dueDate !== undefined ? dueDate : todo.dueDate,
      priority: priority !== undefined ? priority : todo.priority,
      groupName: normalizedGroup,
      updatedAt: Date.now()
    };

    db.todos.set(id, updatedTodo);
    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const todo = db.todos.get(id);

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  if (todo.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  db.todos.delete(id);
  return NextResponse.json({ success: true });
}
