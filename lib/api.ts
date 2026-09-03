import { Memo } from '@/types/memo';
import { TodoItem } from '@/types/calendar';

export async function fetchMemosFromDB(): Promise<Memo[] | null> {
  try {
    const res = await fetch('/api/memos', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('fetchMemosFromDB error:', err);
    return null;
  }
}

export async function saveMemoToDB(memo: Memo): Promise<boolean> {
  try {
    const res = await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memo),
    });
    return res.ok;
  } catch (err) {
    console.error('saveMemoToDB error:', err);
    return false;
  }
}

export async function deleteMemoFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/memos/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('deleteMemoFromDB error:', err);
    return false;
  }
}

export async function fetchTodosFromDB(): Promise<TodoItem[] | null> {
  try {
    const res = await fetch('/api/todos', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('fetchTodosFromDB error:', err);
    return null;
  }
}

export async function saveTodoToDB(todo: TodoItem): Promise<boolean> {
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    return res.ok;
  } catch (err) {
    console.error('saveTodoToDB error:', err);
    return false;
  }
}

export async function deleteTodoFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('deleteTodoFromDB error:', err);
    return false;
  }
}
