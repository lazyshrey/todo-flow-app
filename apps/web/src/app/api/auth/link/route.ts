import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/database';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userConfig = db.users.get(userId);
  return NextResponse.json({
    discordId: userConfig?.discordId || null,
    username: userConfig?.discordUsername || null
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let code: string;
  try {
    const body = await req.json();
    code = body.code;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!code || typeof code !== 'string' || code.length !== 6) {
    return NextResponse.json({ error: 'Invalid linking code' }, { status: 400 });
  }

  try {
    const record = db.linkCodes.get(code);
    if (!record) {
      return NextResponse.json({ error: 'Code not found or expired' }, { status: 400 });
    }

    if (record.expiresAt < Date.now()) {
      db.linkCodes.delete(code);
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
    }

    const { discordId, discordUsername } = record;

    // Ensure the user exists in the users table first to satisfy the FK constraint in discord_mappings
    const userConfig = db.users.get(userId) || { clerkId: userId, discordId: null, discordUsername: null, mcpTokens: [] };
    userConfig.discordId = discordId;
    userConfig.discordUsername = discordUsername || null;
    db.users.set(userId, userConfig);

    // Save mappings
    db.discordMappings.set(discordId, { userId });

    // Consume the link code
    db.linkCodes.delete(code);

    return NextResponse.json({ success: true, discordId, username: discordUsername });
  } catch (error) {
    console.error('Linking error:', error);
    return NextResponse.json({ error: 'Failed to link account due to database error' }, { status: 500 });
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userConfig = db.users.get(userId);
  if (userConfig && userConfig.discordId) {
    db.discordMappings.delete(userConfig.discordId);
    db.users.updateDiscordId(userId, null);
  }

  return NextResponse.json({ success: true });
}
