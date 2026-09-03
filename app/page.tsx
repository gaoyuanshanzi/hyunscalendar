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
import {
  fetchMemosFromDB, saveMemoToDB, deleteMemoFromDB,
  fetchTodosFromDB, saveTodoToDB, deleteTodoFromDB,
} from '@/lib/api';
import { StickyNote, CalendarDays, Database, Check } from 'lucide-react';

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'memo' | 'calendar'>('memo');
  const [mobileMemoView, setMobileMemoView] = useState<'list' | 'editor'>('list');
  const [dbStatus, setDbStatus] = useState<'syncing' | 'connected' | 'error'>('syncing');

  // Load from DB (with localStorage fallback)
  const loadData = useCallback(async () => {
    // 1. First load local cache for instantaneous UI render
    const localM = getMemos();
    const localT = getTodos();
    setMemos(localM);
    setTodos(localT);
    if (localM.length > 0 && !selectedMemoId) setSelectedMemoId(localM[0].id);

    // 2. Fetch from Neon DB
    setDbStatus('syncing');
    try {
      const dbMemos = await fetchMemosFromDB();
      const dbTodos = await fetchTodosFromDB();

      if (dbMemos !== null) {
        setMemos(dbMemos);
        saveMemos(dbMemos);
        if (dbMemos.length > 0) setSelectedMemoId((prev) => prev || dbMemos[0].id);
      }
      if (dbTodos !== null) {
        setTodos(dbTodos);
        saveTodos(dbTodos);
      }
      setDbStatus('connected');
    } catch (err) {
      console.error('DB Sync Error:', err);
      setDbStatus('error');
    }
  }, [selectedMemoId]);

  useEffect(() => {
    const auth = getIsAuthenticated();
    setIsAuth(auth);
    if (auth) {
      loadData();
    }
    setHydrated(true);
  }, [loadData]);

  const handleLogin = () => {
    setAuthenticated(true);
    setIsAuth(true);
    loadData();
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      setAuthenticated(false);
      setIsAuth(false);
      setSelectedMemoId(null);
    }
  };

  // Memo operations with DB real-time sync
  const handleCreateMemo = useCallback(async () => {
    const newMemo = createMemo('새 메모', '', '');
    const updated = [newMemo, ...memos];
    setMemos(updated);
    saveMemos(updated);
    setSelectedMemoId(newMemo.id);
    setMobileMemoView('editor');
    // Realtime save to Neon DB
    await saveMemoToDB(newMemo);
  }, [memos]);

  const handleSaveMemo = useCallback(
    async (id: string, title: string, content: string, plainText: string) => {
      const updated = updateMemo(memos, id, { title, content, plainTextPreview: plainText });
      setMemos(updated);
      saveMemos(updated);
      const target = updated.find((m) => m.id === id);
      if (target) {
        // Realtime save to Neon DB
        await saveMemoToDB(target);
      }
    },
    [memos]
  );

  const handleDeleteMemo = useCallback(
    async (id: string) => {
      const updated = deleteMemo(memos, id);
      setMemos(updated);
      saveMemos(updated);
      if (selectedMemoId === id) {
        setSelectedMemoId(updated.length > 0 ? updated[0].id : null);
        setMobileMemoView('list');
      }
      // Realtime delete from Neon DB
      await deleteMemoFromDB(id);
    },
    [memos, selectedMemoId]
  );

  const handleTogglePin = useCallback(
    async (id: string) => {
      const memo = memos.find((m) => m.id === id);
      if (!memo) return;
      const updated = updateMemo(memos, id, { isPinned: !memo.isPinned });
      setMemos(updated);
      saveMemos(updated);
      const target = updated.find((m) => m.id === id);
      if (target) {
        await saveMemoToDB(target);
      }
    },
    [memos]
  );

  // Todo operations with DB real-time sync
  const handleTodosChange = useCallback(
    async (newTodos: TodoItem[]) => {
      // Find what changed: newly added or modified vs deleted
      const newIds = new Set(newTodos.map((t) => t.id));

      // Deleted
      for (const old of todos) {
        if (!newIds.has(old.id)) {
          deleteTodoFromDB(old.id).catch(console.error);
        }
      }

      // Added or updated
      for (const current of newTodos) {
        const prev = todos.find((t) => t.id === current.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(current)) {
          saveTodoToDB(current).catch(console.error);
        }
      }

      setTodos(newTodos);
      saveTodos(newTodos);
    },
    [todos]
  );

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
      <Header onLogout={handleLogout} onDataChange={loadData} />

      {/* DB Status & Mobile Tabs Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white px-2 py-1.5 shrink-0">
        {/* Two mobile tabs: Tab 1 (Memo) & Tab 2 (Calendar) */}
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setMobileTab('memo')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition
              ${mobileTab === 'memo'
                ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300'
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <StickyNote size={14} className="text-amber-600 fill-amber-300" />
            메모장 (목록/내용)
          </button>
          <button
            onClick={() => setMobileTab('calendar')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition
              ${mobileTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <CalendarDays size={14} />
            달력
          </button>
        </div>
      </div>

      {/* DB real-time indicator bar (subtle) */}
      <div className="hidden md:flex items-center justify-end px-4 py-1 text-[11px] bg-amber-50/50 border-b border-amber-200/50 text-amber-800 gap-1.5 shrink-0">
        <Database size={12} className="text-amber-600" />
        <span>Neon DB 실시간 연동:</span>
        {dbStatus === 'connected' ? (
          <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
            <Check size={12} /> 실시간 저장 활성
          </span>
        ) : dbStatus === 'syncing' ? (
          <span className="text-amber-600">동기화 중...</span>
        ) : (
          <span className="text-stone-500">로컬 캐시 모드</span>
        )}
      </div>

      {/* Main 3-Column Layout (Desktop) / Tab Views (Mobile) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile View Handling */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden">
          {mobileTab === 'memo' ? (
            <div className="h-full flex flex-col overflow-hidden bg-[#FEFCE8]">
              {/* Sub-toggle on mobile between Directory and Editor */}
              <div className="flex items-center justify-between p-2 border-b border-amber-200 bg-[#FEF08A]/80">
                <span className="text-xs font-bold text-amber-900">
                  {mobileMemoView === 'list' ? '메모 디렉토리' : '메모 작성'}
                </span>
                <button
                  onClick={() => setMobileMemoView(mobileMemoView === 'list' ? 'editor' : 'list')}
                  className="text-xs px-2.5 py-1 rounded-md bg-amber-200 text-amber-950 font-medium hover:bg-amber-300 transition"
                >
                  {mobileMemoView === 'list' ? '에디터 보기 →' : '← 메모 목록'}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {mobileMemoView === 'list' ? (
                  <MemoDirectory
                    memos={memos}
                    selectedMemoId={selectedMemoId}
                    onSelectMemo={(id) => {
                      setSelectedMemoId(id);
                      setMobileMemoView('editor');
                    }}
                    onCreateMemo={handleCreateMemo}
                    onDeleteMemo={handleDeleteMemo}
                    onTogglePin={handleTogglePin}
                  />
                ) : (
                  <MemoEditor
                    memo={selectedMemo}
                    onSave={handleSaveMemo}
                    onDelete={handleDeleteMemo}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <CalendarView
                todos={todos}
                onTodosChange={handleTodosChange}
              />
            </div>
          )}
        </div>

        {/* Desktop 3-Column View */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Column 1: Memo Directory (Post-it pale yellow) */}
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

          {/* Column 2: Selected Memo Content (Post-it pale yellow) */}
          <div className="flex-[2] min-w-0 overflow-hidden border-r border-[#FDE047]/80">
            <MemoEditor
              memo={selectedMemo}
              onSave={handleSaveMemo}
              onDelete={handleDeleteMemo}
            />
          </div>

          {/* Column 3: Calendar View (Double height & Drag-Drop) */}
          <div className="flex-[3] min-w-0 overflow-hidden">
            <CalendarView
              todos={todos}
              onTodosChange={handleTodosChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
