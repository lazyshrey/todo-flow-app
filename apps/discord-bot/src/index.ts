import { 
  Events, 
  Interaction, 
  REST, 
  Routes, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  Message
} from 'discord.js';
import { client, token, clientId, botSecret, apiUrl, webUrl } from './config';
import { commands } from './commands';
import { activeCaptureSessions, startCaptureSession } from './capture';
import { activeListTimeouts, setupBacklogTimeout, setupDetailsTimeout } from './timeouts';
import { callApi, ensureLinked } from './api';
import { 
  buildTodoListEmbed, 
  buildTodoListComponents, 
  buildLinkEmbed, 
  buildTaskDetailsEmbed, 
  buildTaskDetailsComponents, 
  buildCaptureDraftEmbed, 
  buildCaptureDraftComponents, 
  buildCreateTaskModal, 
  buildEditTaskModal 
} from './embeds';
import { parseSubTodos, serializeSubTodos, parseDueDateString } from './utils';

// Fetch and build the active todo list message payload
async function getTodoListPayload(discordId: string, username: string) {
  const res = await callApi('get_todos', { id: discordId, username });
  const todos = res.todos || [];
  const embed = buildTodoListEmbed(todos, username);
  const components = buildTodoListComponents(todos);
  return { embeds: [embed], components };
}

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  
  // Register Slash Commands
  const rest = new REST({ version: '10' }).setToken(token as string);
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(clientId as string),
      { body: commands }
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

// Event listener for bot mention ping greetings
client.on(Events.MessageCreate, async (message: Message) => {
  try {
    if (message.author.bot) return;
    if (client.user && message.mentions.users.has(client.user.id)) {
      const botAvatar = client.user.displayAvatarURL();
      
      const greetingEmbed = new EmbedBuilder()
        .setColor(0x282b30)
        .setTitle('👋 Welcome to Todo Flow!')
        .setDescription(
          `Manage your tasks directly from Discord.\n\n` +
          `**/todo link** — Connect your Discord account to your Web Profile.\n` +
          `**/todo list** — Open your interactive backlog (view details, toggle checklists, share, edit, or delete).\n` +
          `**/todo new** — Start capture mode (type details directly in chat, or use private modals).\n\n` +
          `*Syncs instantly to your web profile.*`
        )
        .setThumbnail(botAvatar)
        .setTimestamp();

      const btnWeb = new ButtonBuilder()
        .setLabel('Open Web Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL(webUrl);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnWeb);

      try {
        await message.author.send({ embeds: [greetingEmbed], components: [row] });
      } catch (dmError) {
        // Fallback to replying in public channel if the user has disabled/blocked DMs
        await message.reply({ 
          content: '⚠️ I tried to DM you, but your DMs are closed! Here are the instructions:', 
          embeds: [greetingEmbed], 
          components: [row] 
        });
      }
    }
  } catch (error) {
    console.error('Error handling message create event:', error);
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  try {
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'link') {
        await interaction.deferReply({ ephemeral: true });

        // Check if already linked
        try {
          const resLink = await callApi('get_todos', interaction.user);
          if (resLink && resLink.error !== 'NOT_LINKED') {
            const linkedEmbed = new EmbedBuilder()
              .setColor(0x282b30)
              .setTitle('🔗 Account Already Linked')
              .setDescription(
                `Your Discord account is already linked to your Todo profile!\n\n` +
                `If you want to unlink your account, you can do so from the **Settings** tab in the Web Application, or click the **Unlink Account** button below.`
              );

            const btnUnlink = new ButtonBuilder()
              .setCustomId('unlink_discord_btn')
              .setLabel('Unlink Account')
              .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnUnlink);

            await interaction.editReply({ embeds: [linkedEmbed], components: [row] });
            return;
          }
        } catch (e) {
          // Ignore error and proceed to link (in case they are not linked)
        }

        const res = await callApi('generate_link_code', interaction.user);
        const linkEmbed = buildLinkEmbed(res.code);
        await interaction.editReply({ embeds: [linkEmbed] });
        return;
      }

      // Check linkage for all other commands
      const linked = await ensureLinked(interaction);
      if (!linked) return;

      if (subcommand === 'list') {
        await interaction.deferReply({ ephemeral: true });
        const payload = await getTodoListPayload(interaction.user.id, interaction.user.username);
        await interaction.editReply(payload);
        setupBacklogTimeout(interaction);
      } else if (subcommand === 'new') {
        const title = interaction.options.getString('title') || undefined;
        const tag = interaction.options.getString('tag') || undefined;
        const due = interaction.options.getString('due') || undefined;
        await startCaptureSession(interaction, undefined, { title, tag, due });
      }
    }

    // 2. Handle Buttons
    else if (interaction.isButton()) {
      // Main view controls
      if (interaction.customId === 'add_todo_btn') {
        await startCaptureSession(interaction);
      } else if (interaction.customId === 'add_todo_form_btn') {
        const modal = buildCreateTaskModal();
        await interaction.showModal(modal);
      } else if (interaction.customId === 'refresh_todo_btn' || interaction.customId === 'back_to_list_btn') {
        await interaction.deferUpdate();
        const payload = await getTodoListPayload(interaction.user.id, interaction.user.username);
        await interaction.editReply(payload);
        setupBacklogTimeout(interaction);
      } else if (interaction.customId === 'unlink_discord_btn') {
        await interaction.deferUpdate();
        await callApi('unlink_account', interaction.user);
        await interaction.editReply({
          content: '✅ Your Discord account has been unlinked successfully.',
          embeds: [],
          components: []
        });

        // Clear any active backlog/details timeouts
        const existingTimeout = activeListTimeouts.get(interaction.user.id);
        if (existingTimeout) {
          clearTimeout(existingTimeout.timer);
          activeListTimeouts.delete(interaction.user.id);
        }
      }
      
      // Capture session button handlers
      else if (interaction.customId === 'capture_set_title') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.state = 'title';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_set_category') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.state = 'category';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_set_duedate') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.state = 'due_date';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_toggle_format') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.format = session.format === 'checklist' ? 'text' : 'checklist';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_start') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.state = 'capture';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_stop') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          session.state = 'idle';
          const embed = buildCaptureDraftEmbed(session);
          const components = buildCaptureDraftComponents(session);
          await interaction.editReply({ embeds: [embed], components });
        }
      } else if (interaction.customId === 'capture_cancel') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          if (session.collector) {
            session.collector.stop('cancelled');
          }
          activeCaptureSessions.delete(interaction.user.id);
          
          // Return to active list
          const payload = await getTodoListPayload(interaction.user.id, interaction.user.username);
          await interaction.editReply(payload);
          setupBacklogTimeout(interaction);
        }
      } else if (interaction.customId === 'capture_use_form') {
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session && session.editTodoId) {
          let notes = '';
          if (session.format === 'checklist') {
            const subTodoObjects = session.checklist.map(text => ({
              id: `${Date.now()}-${Math.random()}`,
              text,
              completed: false
            }));
            notes = serializeSubTodos(subTodoObjects);
          } else {
            notes = session.notesText;
          }
          const mockTodo = {
            id: session.editTodoId,
            title: session.title,
            groupName: session.groupName,
            dueDate: session.dueDate,
            notes
          };
          const modal = buildEditTaskModal(mockTodo);
          await interaction.showModal(modal);
        } else {
          const modal = buildCreateTaskModal(session);
          await interaction.showModal(modal);
        }
      } else if (interaction.customId === 'capture_save') {
        await interaction.deferUpdate();
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          let serializedNotes = '';
          if (session.format === 'checklist') {
            const subTodoObjects = session.checklist.map(text => ({
              id: `${Date.now()}-${Math.random()}`,
              text,
              completed: false
            }));
            serializedNotes = serializeSubTodos(subTodoObjects);
          } else {
            serializedNotes = session.notesText;
          }

          // Create the todo
          const res = await callApi('create_todo', interaction.user, {
            title: session.title,
            notes: serializedNotes,
            groupName: session.groupName,
            dueDate: session.dueDate
          });
          
          if (session.collector) {
            session.collector.stop('saved');
          }
          activeCaptureSessions.delete(interaction.user.id);

          const todo = res.todo;
          const embed = buildTaskDetailsEmbed(todo);
          const components = buildTaskDetailsComponents(todo);
          
          await interaction.editReply({ content: '✅ Todo created successfully!', embeds: [embed], components });
          setupDetailsTimeout(interaction, todo.id);
        }
      }

      // Details view control handlers
      else if (interaction.customId.startsWith('complete_task_btn:')) {
        await interaction.deferUpdate();
        const todoId = interaction.customId.split(':')[1];
        
        // Complete the todo
        await callApi('complete_todo', interaction.user, { todoId });
        
        // Return to main list
        const payload = await getTodoListPayload(interaction.user.id, interaction.user.username);
        await interaction.editReply(payload);
        setupBacklogTimeout(interaction);
      } else if (interaction.customId.startsWith('edit_task_btn:')) {
        const todoId = interaction.customId.split(':')[1];
        await interaction.deferUpdate();
        
        const res = await callApi('get_todos', interaction.user);
        const todos = res.todos || [];
        const todo = todos.find((t: any) => t.id === todoId);
        
        if (todo) {
          await startCaptureSession(interaction, todo);
        }
      } else if (interaction.customId.startsWith('edit_task_form_btn:')) {
        const todoId = interaction.customId.split(':')[1];
        
        const res = await callApi('get_todos', interaction.user);
        const todos = res.todos || [];
        const todo = todos.find((t: any) => t.id === todoId);
        
        if (todo) {
          const modal = buildEditTaskModal(todo);
          await interaction.showModal(modal);
        }
      } else if (interaction.customId.startsWith('edit_save:')) {
        await interaction.deferUpdate();
        const todoId = interaction.customId.split(':')[1];
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          let serializedNotes = '';
          if (session.format === 'checklist') {
            const subTodoObjects = session.checklist.map(text => ({
              id: `${Date.now()}-${Math.random()}`,
              text,
              completed: false
            }));
            serializedNotes = serializeSubTodos(subTodoObjects);
          } else {
            serializedNotes = session.notesText;
          }

          // Edit the todo via API
          const res = await callApi('edit_todo', interaction.user, {
            todoId,
            title: session.title,
            notes: serializedNotes,
            groupName: session.groupName,
            dueDate: session.dueDate
          });
          
          if (session.collector) {
            session.collector.stop('saved');
          }
          activeCaptureSessions.delete(interaction.user.id);

          const todo = res.todo;
          const embed = buildTaskDetailsEmbed(todo);
          const components = buildTaskDetailsComponents(todo);
          
          await interaction.editReply({ content: '✏️ Task updated successfully!', embeds: [embed], components });
          setupDetailsTimeout(interaction, todo.id);
        }
      } else if (interaction.customId.startsWith('delete_task_btn:')) {
        await interaction.deferUpdate();
        const todoId = interaction.customId.split(':')[1];
        
        // Delete task
        await callApi('delete_todo', interaction.user, { todoId });
        
        // Reply and show list
        const payload = await getTodoListPayload(interaction.user.id, interaction.user.username);
        await interaction.editReply(payload);
        setupBacklogTimeout(interaction);
      } else if (interaction.customId.startsWith('share_task_btn:')) {
        await interaction.deferReply({ ephemeral: true });
        const todoId = interaction.customId.split(':')[1];
        
        // Get todo details
        const res = await callApi('get_todos', interaction.user);
        const todos = res.todos || [];
        const todo = todos.find((t: any) => t.id === todoId);
        
        if (!todo) {
          await interaction.editReply({ content: '❌ Task not found or already completed.' });
          return;
        }

        const embed = buildTaskDetailsEmbed(todo);
        
        // Share publicly in the channel
        const channel = interaction.channel;
        if (channel && 'send' in channel) {
          await (channel as any).send({
            content: `📢 **${interaction.user.username}** shared a task:`,
            embeds: [embed]
          });
        }

        await interaction.editReply({ content: '📢 Task shared to the channel successfully!' });
      }
    }

    // 3. Handle Select Menus
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'view_todo_select') {
        await interaction.deferUpdate();
        const todoId = interaction.values[0];
        
        const res = await callApi('get_todos', interaction.user);
        const todos = res.todos || [];
        const todo = todos.find((t: any) => t.id === todoId);
        
        if (!todo) {
          await interaction.followUp({ content: '❌ Task details not found.', ephemeral: true });
          return;
        }

        const embed = buildTaskDetailsEmbed(todo);
        const components = buildTaskDetailsComponents(todo);
        
        await interaction.editReply({ embeds: [embed], components });
        setupDetailsTimeout(interaction, todoId);
      } else if (interaction.customId.startsWith('toggle_subtodo_select:')) {
        await interaction.deferUpdate();
        const todoId = interaction.customId.split(':')[1];
        const subTodoIndex = parseInt(interaction.values[0], 10);
        
        // Get current todo
        const getRes = await callApi('get_todos', interaction.user);
        const todos = getRes.todos || [];
        const todo = todos.find((t: any) => t.id === todoId);
        
        if (!todo) {
          await interaction.followUp({ content: '❌ Task not found.', ephemeral: true });
          return;
        }

        // Toggle the sub todo
        const subTodos = parseSubTodos(todo.notes);
        if (subTodos[subTodoIndex]) {
          subTodos[subTodoIndex].completed = !subTodos[subTodoIndex].completed;
          const updatedNotes = serializeSubTodos(subTodos);
          
          // Edit notes back via API
          const editRes = await callApi('edit_todo', interaction.user, {
            todoId,
            notes: updatedNotes
          });
          
          // Re-render task details
          const updatedTodo = editRes.todo;
          const embed = buildTaskDetailsEmbed(updatedTodo);
          const components = buildTaskDetailsComponents(updatedTodo);
          
          await interaction.editReply({ embeds: [embed], components });
          setupDetailsTimeout(interaction, todoId);
        }
      }
    }

    // 4. Handle Modal Submissions
    else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'create_task_modal') {
        await interaction.deferReply({ ephemeral: true });
        const title = interaction.fields.getTextInputValue('modal_title');
        const category = interaction.fields.getTextInputValue('modal_category') || 'Inbox';
        const dueDateRaw = interaction.fields.getTextInputValue('modal_due_date');
        const notesRaw = interaction.fields.getTextInputValue('modal_notes') || '';

        const dueDate = parseDueDateString(dueDateRaw);

        // Normalize notes
        let notes = notesRaw.trim();
        if (notes) {
          const lines = notes.split('\n');
          const isChecklist = lines.some(line => line.trim().startsWith('-'));
          if (isChecklist) {
            const subTodos = lines.map(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('-')) {
                if (trimmed.match(/^-\s+\[([ xX])\]/)) {
                  return trimmed;
                }
                const text = trimmed.substring(1).trim();
                return `- [ ] ${text}`;
              }
              return trimmed;
            });
            notes = subTodos.join('\n');
          }
        }

        // Call API to create todo
        const res = await callApi('create_todo', interaction.user, {
          title,
          notes,
          groupName: category,
          dueDate
        });

        // Clean up any active capture session for this user
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          if (session.collector) session.collector.stop('modal_saved');
          activeCaptureSessions.delete(interaction.user.id);
        }

        const todo = res.todo;
        const embed = buildTaskDetailsEmbed(todo);
        const components = buildTaskDetailsComponents(todo);
        await interaction.editReply({ content: 'Todo created successfully!', embeds: [embed], components });
        setupDetailsTimeout(interaction, todo.id);
      } else if (interaction.customId.startsWith('edit_task_modal:')) {
        const todoId = interaction.customId.split(':')[1];
        await interaction.deferReply({ ephemeral: true });
        
        const title = interaction.fields.getTextInputValue('modal_title');
        const category = interaction.fields.getTextInputValue('modal_category') || 'Inbox';
        const dueDateRaw = interaction.fields.getTextInputValue('modal_due_date');
        const notesRaw = interaction.fields.getTextInputValue('modal_notes') || '';

        const dueDate = parseDueDateString(dueDateRaw);

        let notes = notesRaw.trim();
        if (notes) {
          const lines = notes.split('\n');
          const isChecklist = lines.some(line => line.trim().startsWith('-'));
          if (isChecklist) {
            const subTodos = lines.map(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('-')) {
                if (trimmed.match(/^-\s+\[([ xX])\]/)) {
                  return trimmed;
                }
                const text = trimmed.substring(1).trim();
                return `- [ ] ${text}`;
              }
              return trimmed;
            });
            notes = subTodos.join('\n');
          }
        }

        // Call API to edit todo
        const res = await callApi('edit_todo', interaction.user, {
          todoId,
          title,
          notes,
          groupName: category,
          dueDate
        });

        // Clean up any active capture session for this user
        const session = activeCaptureSessions.get(interaction.user.id);
        if (session) {
          if (session.collector) session.collector.stop('modal_saved');
          activeCaptureSessions.delete(interaction.user.id);
        }

        const todo = res.todo;
        const embed = buildTaskDetailsEmbed(todo);
        const components = buildTaskDetailsComponents(todo);
        await interaction.editReply({ content: 'Task updated successfully!', embeds: [embed], components });
        setupDetailsTimeout(interaction, todo.id);
      }
    }
  } catch (error: any) {
    console.error('Interaction error:', error);
    const errEmbed = new EmbedBuilder()
      .setColor(0x282b30)
      .setTitle('❌ Error')
      .setDescription(error.message || 'An unexpected error occurred.');
    
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      }
    }
  }
});

client.login(token);
