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

// Resolve web URL from environment or fall back to deriving it from API_URL
const derivedWebUrl = apiUrl.replace(/\/api\/discord$/, '').replace(/\/api$/, '');
let resolvedWebUrl = process.env.WEB_URL || process.env.NEXT_PUBLIC_APP_URL || '';

if (!resolvedWebUrl) {
  const tempUrl = derivedWebUrl || 'http://localhost:3000';
  try {
    const urlObj = new URL(tempUrl);
    if (urlObj.hostname === 'web') {
      urlObj.hostname = 'localhost';
      if (urlObj.port === '3000') {
        urlObj.port = '3010';
      }
      resolvedWebUrl = urlObj.toString().replace(/\/$/, '');
    } else {
      resolvedWebUrl = tempUrl;
    }
  } catch (e) {
    resolvedWebUrl = tempUrl.replace('://web', '://localhost').replace(':3000', ':3010');
  }
}

export const webUrl = resolvedWebUrl;

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
