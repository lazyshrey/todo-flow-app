export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number | null;
  priority?: "Low" | "Medium" | "High";
  groupName?: string;
}

export interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

export type Filter = "all" | "pending" | "completed";

export interface DiscordStatus {
  discordId: string | null;
  username?: string;
  discriminator?: string;
  avatarUrl?: string;
}

export interface TokenItem {
  id: string;
  name: string;
  createdAt: number;
}
