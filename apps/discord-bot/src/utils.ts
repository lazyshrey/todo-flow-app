export function parseDueDateString(str: string | undefined | null): number | null {
  if (!str) return null;
  const cleaned = str.trim().toLowerCase();
  if (cleaned === 'today') {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }
  if (cleaned === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }
  const timestamp = Date.parse(cleaned);
  if (!isNaN(timestamp)) {
    return timestamp;
  }
  return null;
}

export function getFormattedDueDate(dueDate: number | null | undefined): string {
  if (!dueDate) return '';
  const discordTimestamp = Math.floor(dueDate / 1000);
  
  // Check if overdue
  const isOverdue = dueDate < Date.now();
  if (isOverdue) {
    return `⚠️ **Overdue: <t:${discordTimestamp}:d>**`;
  }
  return `📅 **Due: <t:${discordTimestamp}:d>**`;
}

export function getNotesFormat(notesText: string | undefined | null): "text" | "checklist" {
  if (!notesText) return "text";
  const trimmed = notesText.trim();
  if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("- [X]")) {
    return "checklist";
  }
  return "text";
}

export interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

export function parseSubTodos(notesText: string | undefined | null): SubTodo[] {
  if (!notesText) return [];
  const lines = notesText.split("\n");
  const list: SubTodo[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^-\s+\[([ xX])\]\s+(.*)$/);
    if (match) {
      list.push({
        id: `${index}-${Date.now()}-${Math.random()}`,
        completed: match[1].toLowerCase() === "x",
        text: match[2].trim(),
      });
    }
  });
  return list;
}

export function serializeSubTodos(subTodosList: SubTodo[]): string {
  return subTodosList
    .map((item) => `- [${item.completed ? "x" : " "}] ${item.text}`)
    .join("\n");
}
