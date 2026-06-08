import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (Local .env -> Monorepo root .env)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const token = process.env.DISCORD_TOKEN;
export const clientId = process.env.DISCORD_CLIENT_ID;
export const botSecret = process.env.DISCORD_BOT_SECRET;
export const apiUrl = process.env.API_URL || 'http://localhost:3000/api/discord';

if (!token || !clientId || !botSecret) {
  console.error('CRITICAL: Missing Discord bot configuration in environment variables.');
  process.exit(1);
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
