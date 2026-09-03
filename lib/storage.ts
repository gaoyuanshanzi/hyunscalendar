import { Memo } from '@/types/memo';
import { TodoItem } from '@/types/calendar';

const MEMOS_KEY = 'hyunscalendar_memos';
const TODOS_KEY = 'hyunscalendar_todos';
const AUTH_KEY = 'hyunscalendar_auth';

// Auth
export function getIsAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

// Memos
export function getMemos(): Memo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEMOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Memo[];
  } catch {
    return [];
  }
}

export function saveMemos(memos: Memo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMOS_KEY, JSON.stringify(memos));
}

export function createMemo(title: string, content: string, plainTextPreview: string): Memo {
  const now = new Date().toISOString();
  return {
    id: `memo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title: title || '제목 없음',
    content,
    plainTextPreview,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
}

export function updateMemo(memos: Memo[], id: string, updates: Partial<Memo>): Memo[] {
  return memos.map((m) =>
    m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
  );
}

export function deleteMemo(memos: Memo[], id: string): Memo[] {
  return memos.filter((m) => m.id !== id);
}

// Todos
export function getTodos(): TodoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TodoItem[];
  } catch {
    return [];
  }
}

export function saveTodos(todos: TodoItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function createTodo(date: string, time: string, title: string, description?: string, color?: string): TodoItem {
  return {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    date,
    time,
    title,
    description,
    completed: false,
    color: color || 'blue',
    createdAt: new Date().toISOString(),
  };
}

export function updateTodo(todos: TodoItem[], id: string, updates: Partial<TodoItem>): TodoItem[] {
  return todos.map((t) => (t.id === id ? { ...t, ...updates } : t));
}

export function deleteTodo(todos: TodoItem[], id: string): TodoItem[] {
  return todos.filter((t) => t.id !== id);
}

export function getTodosForDate(todos: TodoItem[], date: string): TodoItem[] {
  return todos.filter((t) => t.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

// JSON Export/Import
export function exportAllData(): string {
  const memos = getMemos();
  const todos = getTodos();
  return JSON.stringify({ memos, todos, exportedAt: new Date().toISOString() }, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.memos) saveMemos(data.memos);
    if (data.todos) saveTodos(data.todos);
    return true;
  } catch {
    return false;
  }
}
