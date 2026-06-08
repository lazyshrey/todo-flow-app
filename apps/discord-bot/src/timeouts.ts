import { buildTodoListEmbed, buildTodoListComponents, buildTaskDetailsEmbed, buildTaskDetailsComponents } from './embeds';
import { callApi } from './api';

export const activeListTimeouts = new Map<string, { timer: NodeJS.Timeout; interaction: any }>();

export function setupMessageTimeout(interaction: any, disableFn: () => Promise<void>) {
  const userId = interaction.user.id;
  
  const existing = activeListTimeouts.get(userId);
  if (existing) {
    clearTimeout(existing.timer);
    activeListTimeouts.delete(userId);
  }
  
  const timer = setTimeout(async () => {
    try {
      await disableFn();
    } catch (e) {
      console.warn("Failed to disable components on timeout:", e);
    }
    activeListTimeouts.delete(userId);
  }, 180000); // 3 minutes timeout
  
  activeListTimeouts.set(userId, { timer, interaction });
}

export function setupBacklogTimeout(interaction: any) {
  setupMessageTimeout(interaction, async () => {
    const res = await callApi('get_todos', interaction.user);
    const todos = res.todos || [];
    const embed = buildTodoListEmbed(todos, interaction.user.username);
    const components = buildTodoListComponents(todos);
    
    components.forEach((row: any) => {
      row.components.forEach((comp: any) => comp.setDisabled(true));
    });
    
    await interaction.editReply({
      content: '⏱️ Interactive backlog session timed out.',
      embeds: [embed],
      components
    }).catch(() => {});
  });
}

export function setupDetailsTimeout(interaction: any, todoId: string) {
  setupMessageTimeout(interaction, async () => {
    const res = await callApi('get_todos', interaction.user);
    const todos = res.todos || [];
    const todo = todos.find((t: any) => t.id === todoId);
    if (todo) {
      const embed = buildTaskDetailsEmbed(todo);
      const components = buildTaskDetailsComponents(todo);
      
      components.forEach((row: any) => {
        row.components.forEach((comp: any) => comp.setDisabled(true));
      });
      
      await interaction.editReply({
        content: '⏱️ Interactive task details session timed out.',
        embeds: [embed],
        components
      }).catch(() => {});
    }
  });
}
