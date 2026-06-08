import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/database';
import crypto from 'crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all tokens matching this userId
  const userTokens = db.mcpTokens.getByUser(userId);
  const tokens = userTokens.map((t: any) => ({
    name: t.name,
    createdAt: t.createdAt,
    maskedToken: t.token.substring(0, 9) + '...' + t.token.substring(t.token.length - 4),
    id: t.token // Send actual token key for deletion/revocation
  }));

  return NextResponse.json({ tokens });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Token name is required' }, { status: 400 });
    }

    // Generate a secure random token
    const token = 'todo_mcp_' + crypto.randomBytes(16).toString('hex');
    
    db.mcpTokens.set(token, {
      userId,
      name: name.trim(),
      createdAt: Date.now()
    });

    // Update user record
    const userConfig = db.users.get(userId) || { clerkId: userId, mcpTokens: [] };
    if (!userConfig.mcpTokens.includes(token)) {
      userConfig.mcpTokens.push(token);
    }
    db.users.set(userId, userConfig);

    return NextResponse.json({ token, name: name.trim(), createdAt: Date.now() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const tokenRecord = db.mcpTokens.get(token);
    if (!tokenRecord || tokenRecord.userId !== userId) {
      return NextResponse.json({ error: 'Token not found or forbidden' }, { status: 404 });
    }

    // Delete token
    db.mcpTokens.delete(token);

    // Update user config
    const userConfig = db.users.get(userId);
    if (userConfig) {
      userConfig.mcpTokens = userConfig.mcpTokens.filter((t: string) => t !== token);
      db.users.set(userId, userConfig);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
