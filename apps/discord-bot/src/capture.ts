import { EmbedBuilder } from 'discord.js';
import { parseDueDateString, getNotesFormat, parseSubTodos } from './utils';
import { buildCaptureDraftEmbed, buildCaptureDraftComponents } from './embeds';
import { activeListTimeouts } from './timeouts';

export interface CaptureSession {
  userId: string;
  channelId: string;
  interaction: any;
  state: 'title' | 'category' | 'due_date' | 'capture' | 'idle';
  title: string;
  groupName: string;
  dueDate: number | null;
  format: 'checklist' | 'text';
  checklist: string[];
  notesText: string;
  collector: any;
  editTodoId?: string;
}

export const activeCaptureSessions = new Map<string, CaptureSession>();

// Start interactive todo capture session
export async function startCaptureSession(
  interaction: any, 
  existingTodo?: any, 
  prepopulatedOptions?: { title?: string; tag?: string; due?: string }
) {
  const userId = interaction.user.id;
  
  // Clean up any existing session
  const oldSession = activeCaptureSessions.get(userId);
  if (oldSession) {
    if (oldSession.collector) {
      oldSession.collector.stop('superseded');
    }
    activeCaptureSessions.delete(userId);
  }

  // Clear any existing list timeout
  const existingTimeout = activeListTimeouts.get(userId);
  if (existingTimeout) {
    clearTimeout(existingTimeout.timer);
    activeListTimeouts.delete(userId);
  }

  let initialTitle = '';
  let initialGroupName = 'Inbox';
  let initialDueDate: number | null = null;
  let initialFormat: 'checklist' | 'text' = 'checklist';
  let initialChecklist: string[] = [];
  let initialNotesText = '';
  let editTodoId: string | undefined = undefined;

  if (existingTodo) {
    initialTitle = existingTodo.title || '';
    initialGroupName = existingTodo.groupName || 'Inbox';
    initialDueDate = existingTodo.dueDate || null;
    initialFormat = getNotesFormat(existingTodo.notes);
    if (initialFormat === 'checklist') {
      initialChecklist = parseSubTodos(existingTodo.notes).map(s => s.text);
    } else {
      initialNotesText = existingTodo.notes || '';
    }
    editTodoId = existingTodo.id;
  } else if (prepopulatedOptions) {
    initialTitle = prepopulatedOptions.title || '';
    initialGroupName = prepopulatedOptions.tag || 'Inbox';
    initialDueDate = parseDueDateString(prepopulatedOptions.due);
  }

  // Start in 'idle' if we already have a title, otherwise prompt for 'title'
  const startingState = initialTitle ? 'idle' : 'title';

  // Create new session
  const session: CaptureSession = {
    userId,
    channelId: interaction.channelId,
    interaction,
    state: startingState,
    title: initialTitle,
    groupName: initialGroupName,
    dueDate: initialDueDate,
    format: initialFormat,
    checklist: initialChecklist,
    notesText: initialNotesText,
    collector: null,
    editTodoId
  };

  // Reply ephemerally with initial draft
  const embed = buildCaptureDraftEmbed(session);
  const components = buildCaptureDraftComponents(session);
  
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed], components, ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  }

  const channel = interaction.channel;
  if (!channel) {
    console.error('Channel not found for collector.');
    return;
  }

  // Create message collector with a 1-minute idle inactivity timeout
  const filter = (m: any) => {
    if (m.author.id !== userId) return false;
    const currentSession = activeCaptureSessions.get(userId);
    return currentSession && currentSession.state !== 'idle';
  };
  const collector = channel.createMessageCollector({ filter, time: 300000, idle: 60000 }); // 5 mins max, 1 min idle
  session.collector = collector;

  collector.on('collect', async (message: any) => {
    const currentSession = activeCaptureSessions.get(userId);
    if (!currentSession) {
      collector.stop();
      return;
    }

    const content = message.content.trim();
    if (!content) return;

    // Direct check for cancel / stop command
    if (content.toLowerCase() === 'cancel' || content.toLowerCase() === 'stop') {
      try {
        await message.delete();
      } catch (e) {}
      collector.stop('cancelled');
      return;
    }

    // Immediately delete the message to keep the channel clean
    try {
      await message.delete();
    } catch (e) {
      console.warn("Could not delete message (missing permissions?):", e);
    }

    if (currentSession.state === 'title') {
      currentSession.title = content;
      currentSession.state = 'idle';
    } else if (currentSession.state === 'category') {
      currentSession.groupName = content;
      currentSession.state = 'idle';
    } else if (currentSession.state === 'due_date') {
      currentSession.dueDate = parseDueDateString(content);
      currentSession.state = 'idle';
    } else if (currentSession.state === 'capture') {
      if (currentSession.format === 'checklist') {
        const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
        currentSession.checklist.push(...lines);
      } else {
        currentSession.notesText = currentSession.notesText ? `${currentSession.notesText}\n${content}` : content;
      }
    }

    // Refresh draft embed
    const updatedEmbed = buildCaptureDraftEmbed(currentSession);
    const updatedComponents = buildCaptureDraftComponents(currentSession);
    await currentSession.interaction.editReply({ embeds: [updatedEmbed], components: updatedComponents });
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time' || reason === 'idle' || reason === 'cancelled') {
      const currentSession = activeCaptureSessions.get(userId);
      if (currentSession) {
        if (reason === 'cancelled') {
          currentSession.interaction.editReply({
            content: '❌ Capture session cancelled.',
            embeds: [],
            components: []
          }).catch(() => {});
        } else {
          const actionLabel = currentSession.editTodoId ? 'Task edit' : 'Task creation';
          currentSession.interaction.editReply({
            content: `❌ ${actionLabel} session timed out (changes discarded).`,
            embeds: [],
            components: []
          }).catch(() => {});
        }
        activeCaptureSessions.delete(userId);
      }
    }
  });

  activeCaptureSessions.set(userId, session);
}
