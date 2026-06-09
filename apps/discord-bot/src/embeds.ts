import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { getFormattedDueDate, getNotesFormat, parseSubTodos, serializeSubTodos } from './utils';
import { webUrl } from './config';

function truncateValue(value: string, maxLength: number = 1024): string {
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength - 3) + '...';
}

export function buildTodoListEmbed(todos: any[], username: string) {
  const embed = new EmbedBuilder()
    .setColor(0x282b30)
    .setTitle('Todo Backlog')
    .setTimestamp();

  if (todos.length === 0) {
    embed.setDescription('Your backlog is clear. Enjoy your free time!');
  }

  if (todos.length > 0) {
    todos.slice(0, 15).forEach((todo, idx) => {
      const format = getNotesFormat(todo.notes);
      let detailSnippet = '';
      if (format === 'checklist') {
        const list = parseSubTodos(todo.notes);
        const done = list.filter(item => item.completed).length;
        detailSnippet = `\n> Checklist: ${done}/${list.length} completed`;
      } else if (todo.notes) {
        const cleanNotes = todo.notes.replace(/[\n\r]+/g, ' ');
        detailSnippet = `\n> Notes: ${cleanNotes.substring(0, 80)}${cleanNotes.length > 80 ? '...' : ''}`;
      }

      const category = todo.groupName || 'Inbox';
      const dueDateStr = todo.dueDate ? ` | Due: <t:${Math.floor(todo.dueDate / 1000)}:d>` : '';
      
      embed.addFields({
        name: truncateValue(`${idx + 1}. ${todo.title}`, 256),
        value: truncateValue(`> Category: \`${category}\`${dueDateStr}${detailSnippet}`, 1024),
        inline: false
      });
    });

    if (todos.length > 15) {
      embed.setFooter({ text: `Showing 15 of ${todos.length} tasks. Use the web app for more.` });
    }
  }

  return embed;
}

export function buildTodoListComponents(todos: any[]) {
  const components: any[] = [];

  // Dropdown for viewing task details
  if (todos.length > 0) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('view_todo_select')
      .setPlaceholder('Select a task to view details...')
      .addOptions(
        todos.slice(0, 25).map(todo => {
          const category = todo.groupName || 'Inbox';
          const format = getNotesFormat(todo.notes);
          let desc = `Category: ${category}`;
          if (format === 'checklist') {
            const list = parseSubTodos(todo.notes);
            const done = list.filter(item => item.completed).length;
            desc += ` | Checklist (${done}/${list.length})`;
          }
          return new StringSelectMenuOptionBuilder()
            .setLabel(todo.title.substring(0, 100))
            .setDescription(desc.substring(0, 100))
            .setValue(todo.id);
        })
      );

    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    components.push(selectRow);
  }

  // Buttons row
  const btnCapture = new ButtonBuilder()
    .setCustomId('add_todo_btn')
    .setLabel('⏺️ Quick Capture')
    .setStyle(ButtonStyle.Primary);

  const btnForm = new ButtonBuilder()
    .setCustomId('add_todo_form_btn')
    .setLabel('📄 Use Form')
    .setStyle(ButtonStyle.Secondary);

  const btnRefresh = new ButtonBuilder()
    .setCustomId('refresh_todo_btn')
    .setLabel('Refresh')
    .setStyle(ButtonStyle.Secondary);

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(btnCapture, btnForm, btnRefresh);
  components.push(buttonRow);

  return components;
}

export function buildLinkEmbed(code: string) {
  return new EmbedBuilder()
    .setColor(0x282b30) // Dark cozy gray
    .setTitle('🔗 Link your Discord Account')
    .setDescription(
      `To link your Discord account to your Todo Web Profile:\n\n` +
      `1. Open the Todo Web App at **\`${webUrl}/settings\`**\n` +
      `2. Go to **Discord Integration**\n` +
      `3. Enter the following 6-digit code:\n` +
      `# **\`${code}\`**\n\n` +
      `⚠️ **Note:** This code will expire in **5 minutes**.`
    );
}

// Build the detailed view of a specific todo item
export function buildTaskDetailsEmbed(todo: any) {
  const format = getNotesFormat(todo.notes);
  const category = todo.groupName || 'Inbox';
  const dueDateStr = todo.dueDate ? `<t:${Math.floor(todo.dueDate / 1000)}:d> (<t:${Math.floor(todo.dueDate / 1000)}:R>)` : 'None';
  
  const embed = new EmbedBuilder()
    .setColor(0x282b30)
    .setTitle(truncateValue(todo.title || '', 256))
    .addFields(
      { name: 'Category', value: truncateValue(`\`${category}\``, 1024), inline: true },
      { name: 'Due Date', value: truncateValue(dueDateStr, 1024), inline: true },
      { name: 'Status', value: todo.completed ? 'Completed' : 'Pending', inline: true },
      { name: 'Format', value: format === 'checklist' ? 'Checklist' : 'Text', inline: true }
    )
    .setTimestamp()
    .setFooter({ text: `ID: ${todo.id.substring(0, 8)}` });

  // Add notes or checklists
  if (format === 'checklist') {
    const checklistItems = parseSubTodos(todo.notes);
    if (checklistItems.length > 0) {
      const itemsList = checklistItems.map((item, idx) => {
        const box = item.completed ? '☑️' : '⬜';
        return `${idx + 1}. ${box} ${item.text}`;
      }).join('\n');
      embed.setDescription(truncateValue(`### Checklist:\n${itemsList}`, 4096));
    } else {
      embed.setDescription(`### Checklist:\n*(No items added yet)*`);
    }
  } else {
    embed.setDescription(truncateValue(`### Notes:\n${todo.notes || '*(No description provided)*'}`, 4096));
  }

  return embed;
}

// Build the components for the detailed view
export function buildTaskDetailsComponents(todo: any) {
  const components: any[] = [];
  const format = getNotesFormat(todo.notes);
  
  // Row 1: If checklist, add a select menu to toggle items
  if (format === 'checklist') {
    const checklistItems = parseSubTodos(todo.notes);
    if (checklistItems.length > 0) {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`toggle_subtodo_select:${todo.id}`)
        .setPlaceholder('Toggle checklist item completion...')
        .addOptions(
          checklistItems.slice(0, 25).map((item, idx) => 
            new StringSelectMenuOptionBuilder()
              .setLabel(`${item.completed ? '✓' : '☐'} ${item.text.substring(0, 90)}`)
              .setDescription('Click to toggle completion')
              .setValue(String(idx))
          )
        );
      components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));
    }
  }

  // Row 2: Management buttons (Complete, Edit Capture, Edit Form, Delete)
  const buttonsRow1 = new ActionRowBuilder<ButtonBuilder>();
  
  if (!todo.completed) {
    buttonsRow1.addComponents(
      new ButtonBuilder()
        .setCustomId(`complete_task_btn:${todo.id}`)
        .setLabel('Complete')
        .setStyle(ButtonStyle.Success)
    );
  }
  
  buttonsRow1.addComponents(
    new ButtonBuilder()
      .setCustomId(`edit_task_btn:${todo.id}`)
      .setLabel('✏️ Edit (Capture)')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`edit_task_form_btn:${todo.id}`)
      .setLabel('📄 Edit (Form)')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`delete_task_btn:${todo.id}`)
      .setLabel('Delete')
      .setStyle(ButtonStyle.Danger)
  );
  
  components.push(buttonsRow1);

  // Row 3: Action & Navigation buttons (Share to Channel, Back to List)
  const buttonsRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`share_task_btn:${todo.id}`)
      .setLabel('Share')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('back_to_list_btn')
      .setLabel('Back to List')
      .setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonsRow2);

  return components;
}

export function buildCaptureDraftEmbed(session: any) {
  const category = session.groupName || 'Inbox';
  const dueDateStr = session.dueDate ? `<t:${Math.floor(session.dueDate / 1000)}:d> (<t:${Math.floor(session.dueDate / 1000)}:R>)` : 'None';
  
  const isEdit = !!session.editTodoId;
  const embed = new EmbedBuilder()
    .setColor(0x282b30)
    .setTitle(isEdit ? 'Edit Task (Capture Mode)' : 'Create Task (Capture Mode)')
    .addFields(
      { name: 'Title', value: truncateValue(session.title ? `**${session.title}**` : '*(No title set)*', 1024), inline: false },
      { name: 'Category', value: truncateValue(`\`${category}\``, 1024), inline: true },
      { name: 'Due Date', value: truncateValue(dueDateStr, 1024), inline: true },
      { name: 'Format', value: session.format === 'checklist' ? 'Checklist' : 'Text', inline: true }
    )
    .setTimestamp();

  if (session.state === 'title') {
    embed.setDescription('Please type the TITLE of your task in chat now.');
  } else if (session.state === 'category') {
    embed.setDescription('Please type the TAG/CATEGORY name in chat now.');
  } else if (session.state === 'due_date') {
    embed.setDescription('Please type the DUE DATE in chat now (e.g. today, tomorrow, YYYY-MM-DD).');
  } else if (session.state === 'capture') {
    if (session.format === 'checklist') {
      embed.setDescription('Checklist Capture Active! Send checklist items one by one in chat. Click **Stop Capture** when finished.');
    } else {
      embed.setDescription('Description Capture Active! Send notes/text paragraph in chat. Click **Stop Capture** when finished.');
    }
  } else {
    embed.setDescription('Click any button below to change fields by typing in chat, or **Start Capture** to add task contents.');
  }

  // Display what is captured so far
  if (session.format === 'checklist') {
    if (session.checklist.length > 0) {
      let itemsList = '';
      let addedCount = 0;
      for (let idx = 0; idx < session.checklist.length; idx++) {
        const item = session.checklist[idx];
        const line = `${idx + 1}. ⬜ ${item}\n`;
        if ((itemsList + line).length > 1000) {
          itemsList += `... and ${session.checklist.length - addedCount} more items.`;
          break;
        }
        itemsList += line;
        addedCount++;
      }
      if (itemsList.endsWith('\n')) {
        itemsList = itemsList.slice(0, -1);
      }
      if (!itemsList) {
        itemsList = truncateValue(session.checklist[0], 1000);
      }
      embed.addFields({ name: `Checklist Items (${session.checklist.length})`, value: itemsList });
    }
  } else {
    if (session.notesText) {
      embed.addFields({ name: 'Description', value: truncateValue(session.notesText, 1024) });
    }
  }

  return embed;
}

export function buildCaptureDraftComponents(session: any) {
  const components: any[] = [];
  
  // Row 1: Metadata controls (Title, Category, Due Date, Format)
  const buttonsRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('capture_set_title')
      .setLabel('Set Title')
      .setStyle(session.state === 'title' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('capture_set_category')
      .setLabel('Set Tag')
      .setStyle(session.state === 'category' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('capture_set_duedate')
      .setLabel('Set Due Date')
      .setStyle(session.state === 'due_date' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('capture_toggle_format')
      .setLabel(session.format === 'checklist' ? 'Text Mode' : 'Checklist Mode')
      .setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonsRow1);

  // Row 2: Capture Control, Use Form, Save & Cancel
  const buttonsRow2 = new ActionRowBuilder<ButtonBuilder>();
  
  if (session.state !== 'idle') {
    const label = session.state === 'capture' ? 'Stop Capture' : 'Cancel Input';
    buttonsRow2.addComponents(
      new ButtonBuilder()
        .setCustomId('capture_stop')
        .setLabel(label)
        .setStyle(ButtonStyle.Danger)
    );
  } else {
    buttonsRow2.addComponents(
      new ButtonBuilder()
        .setCustomId('capture_start')
        .setLabel('Start Capture')
        .setStyle(ButtonStyle.Primary)
    );
  }

  // Add the private Use Form option button to Row 2
  buttonsRow2.addComponents(
    new ButtonBuilder()
      .setCustomId('capture_use_form')
      .setLabel('Use Form')
      .setStyle(ButtonStyle.Secondary)
  );

  const saveCustomId = session.editTodoId ? `edit_save:${session.editTodoId}` : 'capture_save';

  buttonsRow2.addComponents(
    new ButtonBuilder()
      .setCustomId(saveCustomId)
      .setLabel(session.editTodoId ? 'Save Changes' : 'Save Task')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!session.title), // Can't save without title
    new ButtonBuilder()
      .setCustomId('capture_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger)
  );
  components.push(buttonsRow2);

  return components;
}

// Build a private Modal Form for task creation
export function buildCreateTaskModal(session?: any) {
  const modal = new ModalBuilder()
    .setCustomId('create_task_modal')
    .setTitle('Create Task');

  const titleInput = new TextInputBuilder()
    .setCustomId('modal_title')
    .setLabel('Title')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter task title...')
    .setRequired(true);

  const categoryInput = new TextInputBuilder()
    .setCustomId('modal_category')
    .setLabel('Category / Tag')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Inbox')
    .setRequired(false);

  const dueDateInput = new TextInputBuilder()
    .setCustomId('modal_due_date')
    .setLabel('Due Date')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('today, tomorrow, or YYYY-MM-DD')
    .setRequired(false);

  const notesInput = new TextInputBuilder()
    .setCustomId('modal_notes')
    .setLabel('Notes (Start lines with - for checklist)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter task notes or - checklist items...')
    .setRequired(false);

  // Pre-populate if we clicked "Use Form" from an active capture session
  if (session) {
    if (session.title) titleInput.setValue(session.title);
    if (session.groupName) categoryInput.setValue(session.groupName);
    if (session.dueDate) {
      const d = new Date(session.dueDate);
      dueDateInput.setValue(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    if (session.format === 'checklist' && session.checklist.length > 0) {
      notesInput.setValue(session.checklist.map((item: string) => `- ${item}`).join('\n'));
    } else if (session.notesText) {
      notesInput.setValue(session.notesText);
    }
  }

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);
  const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(dueDateInput);
  const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput);

  modal.addComponents(row1, row2, row3, row4);
  return modal;
}

// Build a private Modal Form for task editing
export function buildEditTaskModal(todo: any) {
  const modal = new ModalBuilder()
    .setCustomId(`edit_task_modal:${todo.id}`)
    .setTitle('Edit Task');

  const titleInput = new TextInputBuilder()
    .setCustomId('modal_title')
    .setLabel('Title')
    .setStyle(TextInputStyle.Short)
    .setValue(todo.title || '')
    .setRequired(true);

  const categoryInput = new TextInputBuilder()
    .setCustomId('modal_category')
    .setLabel('Category / Tag')
    .setStyle(TextInputStyle.Short)
    .setValue(todo.groupName || 'Inbox')
    .setRequired(false);

  const dueDateInput = new TextInputBuilder()
    .setCustomId('modal_due_date')
    .setLabel('Due Date')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  if (todo.dueDate) {
    const d = new Date(todo.dueDate);
    dueDateInput.setValue(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const notesInput = new TextInputBuilder()
    .setCustomId('modal_notes')
    .setLabel('Notes (Start lines with - for checklist)')
    .setStyle(TextInputStyle.Paragraph)
    .setValue(todo.notes || '')
    .setRequired(false);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);
  const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(dueDateInput);
  const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput);

  modal.addComponents(row1, row2, row3, row4);
  return modal;
}
