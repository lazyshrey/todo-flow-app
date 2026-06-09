import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Manage your Todo list')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all your active todos')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('new')
        .setDescription('Create a new todo task')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Optional: Title of the task')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('tag')
            .setDescription('Optional: Category/tag for the task')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('due')
            .setDescription('Optional: Due date (e.g. today, tomorrow, YYYY-MM-DD)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Link your Discord account to the Todo Web Application')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ping')
        .setDescription('Check the bot latency and heartbeat')
    )
].map(command => command.toJSON());
