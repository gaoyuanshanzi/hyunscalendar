'use client';

import { useEffect, useState, useCallback } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import MemoDirectory from '@/components/memo/MemoDirectory';
import MemoEditor from '@/components/memo/MemoEditor';
import CalendarView from '@/components/calendar/CalendarView';
import Header from '@/components/ui/Header';
import { Memo } from '@/types/memo';
import { TodoItem } from '@/types/calendar';
import {
  getIsAuthenticated, setAuthenticated,
  getMemos, saveMemos, createMemo, updateMemo, deleteMemo,
  getTodos, saveTodos,
} from '@/lib/storage';

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    const auth = getIsAuthenticated();
    setIsAuth(auth);
    if (auth) {
      const m = getMemos();
      const t = getTodos();
      setMemos(m);
      setTodos(t);
      if (m.length > 0) setSelectedMemoId(m[0].id);
    }
    setHydrated(true);
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    setIsAuth(true);
    const m = getMemos();
    const t = getTodos();
    setMemos(m);
    setTodos(t);
    if (m.length > 0) setSelectedMemoId(m[0].id);
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      setAuthenticated(false);
      setIsAuth(false);
      setSelectedMemoId(null);
    }
  };

  // Memo operations
  const handleCreateMemo = useCallback(() => {
    const newMemo = createMemo('새 메모', '', '');
    const updated = [newMemo, ...memos];
    setMemos(updated);
    saveMemos(updated);
    setSelectedMemoId(newMemo.id);
  }, [memos]);

  const handleSaveMemo = useCallback(
    (id: string, title: string, content: string, plainText: string) => {
      const updated = updateMemo(memos, id, { title, content, plainTextPreview: plainText });
      setMemos(updated);
      saveMemos(updated);
    },
    [memos]
  );

  const handleDeleteMemo = useCallback(
    (id: string) => {
      const updated = deleteMemo(memos, id);
      setMemos(updated);
      saveMemos(updated);
      if (selectedMemoId === id) {
        setSelectedMemoId(updated.length > 0 ? updated[0].id : null);
      }
    },
    [memos, selectedMemoId]
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      const memo = memos.find((m) => m.id === id);
      if (!memo) return;
      const updated = updateMemo(memos, id, { isPinned: !memo.isPinned });
      setMemos(updated);
      saveMemos(updated);
    },
    [memos]
  );

  // Todos
  const handleTodosChange = useCallback((newTodos: TodoItem[]) => {
    setTodos(newTodos);
    saveTodos(newTodos);
  }, []);

  // Data reload (after import)
  const handleDataChange = useCallback(() => {
    const m = getMemos();
    const t = getTodos();
    setMemos(m);
    setTodos(t);
    setSelectedMemoId(m.length > 0 ? m[0].id : null);
  }, []);

  const selectedMemo = memos.find((m) => m.id === selectedMemoId) || null;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!isAuth) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header onLogout={handleLogout} onDataChange={handleDataChange} />

      {/* 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Memo Directory */}
        <div className="w-56 xl:w-64 shrink-0 overflow-hidden flex flex-col">
          <MemoDirectory
            memos={memos}
            selectedMemoId={selectedMemoId}
            onSelectMemo={setSelectedMemoId}
            onCreateMemo={handleCreateMemo}
            onDeleteMemo={handleDeleteMemo}
            onTogglePin={handleTogglePin}
          />
        </div>

        {/* Column 2: Memo Editor */}
        <div className="flex-[2] min-w-0 overflow-hidden border-x border-gray-200">
          <MemoEditor
            memo={selectedMemo}
            onSave={handleSaveMemo}
            onDelete={handleDeleteMemo}
          />
        </div>

        {/* Column 3: Calendar */}
        <div className="flex-[3] min-w-0 overflow-hidden">
          <CalendarView
            todos={todos}
            onTodosChange={handleTodosChange}
          />
        </div>
      </div>
    </div>
  );
}
