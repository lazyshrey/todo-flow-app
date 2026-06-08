import { SubTodo } from "./types";

// Markdown checklist format parser
export function getNotesFormat(notesText: string | undefined | null): "text" | "checklist" {
  if (!notesText) return "text";
  const trimmed = notesText.trim();
  if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("- [X]")) {
    return "checklist";
  }
  return "text";
}

// Markdown Sub-Todo Parser
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

// Markdown Sub-Todo Serializer
export function serializeSubTodos(subTodosList: SubTodo[]): string {
  return subTodosList
    .map((item) => `- [${item.completed ? "x" : " "}] ${item.text}`)
    .join("\n");
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDueDate(dueDateTimestamp: number | null | undefined): { text: string; isOverdue: boolean } | null {
  if (!dueDateTimestamp) return null;
  const diff = dueDateTimestamp - Date.now();
  const isOverdue = diff < 0;
  
  const dateStr = new Date(dueDateTimestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  
  if (isOverdue) {
    return { text: `Overdue (${dateStr})`, isOverdue: true };
  }
  
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return { text: `Due today`, isOverdue: false };
  if (days === 1) return { text: `Due tomorrow`, isOverdue: false };
  if (days < 7) return { text: `Due in ${days} days`, isOverdue: false };
  return { text: `Due ${dateStr}`, isOverdue: false };
}

// Safe Clipboard Copy Helper (supports http / insecure contexts)
export function copyTextToClipboard(text: string): boolean {
  if (typeof window === "undefined") return false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Async clipboard copy failed:", err);
    });
    return true;
  }

  // Fallback for insecure contexts (HTTP)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}
