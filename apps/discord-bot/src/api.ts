import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { apiUrl, botSecret } from './config';

export async function callApi(action: string, user: { id: string; username?: string } | string, extraData: any = {}) {
  const discordId = typeof user === 'string' ? user : user.id;
  const username = typeof user === 'string' ? undefined : user.username;
  
  try {
    const response = await axios.post(
      apiUrl,
      { action, discordId, ...(username ? { username } : {}), ...extraData },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${botSecret}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`API Call failed (${action}):`, error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || 'API Connection Error');
  }
}

export async function ensureLinked(interaction: any): Promise<boolean> {
  try {
    const res = await callApi('get_todos', interaction.user);
    if (res.error === 'NOT_LINKED') {
      const linkEmbed = new EmbedBuilder()
        .setColor(0x282b30)
        .setTitle('❌ Account Not Linked')
        .setDescription(
          `Your Discord account is not linked to your Todo profile yet.\n\n` +
          `Please run **\`/todo link\`** to generate a link code and connect your accounts.`
        );
      await interaction.reply({ embeds: [linkEmbed], ephemeral: true });
      return false;
    }
    return true;
  } catch (e) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0x282b30)
      .setTitle('❌ Service Error')
      .setDescription('Could not communicate with the Todo API. Is the server running?');
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return false;
  }
}
