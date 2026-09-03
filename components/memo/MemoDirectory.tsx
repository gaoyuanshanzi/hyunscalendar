'use client';

import { Memo } from '@/types/memo';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FilePlus, Search, Pin, Trash2, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MemoDirectoryProps {
  memos: Memo[];
  selectedMemoId: string | null;
  onSelectMemo: (id: string) => void;
  onCreateMemo: () => void;
  onDeleteMemo: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function MemoDirectory({
  memos,
  selectedMemoId,
  onSelectMemo,
  onCreateMemo,
  onDeleteMemo,
  onTogglePin,
}: MemoDirectoryProps) {
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = memos
    .filter(
      (m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.plainTextPreview.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortAsc ? -cmp : cmp;
    });

  return (
    <div className="h-full flex flex-col bg-[#FEFCE8] border-r border-[#FDE047]/80 select-none">
      {/* Post-it Header */}
      <div className="px-4 py-3.5 border-b border-[#FDE047] bg-[#FEF08A]/90 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
            <StickyNote size={16} className="text-amber-600 fill-amber-300" />
            메모 목록 ({memos.length})
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              title="정렬 순서 변경"
              className="p-1 text-amber-800 hover:bg-amber-200/70 rounded-lg transition"
            >
              {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={onCreateMemo}
              title="새 메모 만들기"
              className="p-1 text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition flex items-center gap-1 text-xs font-semibold px-2 py-1 shadow-xs"
            >
              <FilePlus size={13} />
              새 메모
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-700/60" />
          <input
            type="text"
            placeholder="메모 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-amber-300/80 rounded-lg bg-yellow-50/90 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white text-amber-950 placeholder:text-amber-700/50 transition"
          />
        </div>
      </div>

      {/* New Memo Quick Add Bar */}
      <div className="px-3 py-2">
        <button
          onClick={onCreateMemo}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300/80 rounded-lg py-2 font-medium transition shadow-xs"
        >
          <FilePlus size={13} />
          + 새 메모 추가
        </button>
      </div>

      {/* Memo List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-amber-700/60">
            <StickyNote size={32} className="mb-2 opacity-30" />
            <p className="text-xs">메모가 없습니다</p>
          </div>
        ) : (
          filtered.map((memo) => (
            <MemoItem
              key={memo.id}
              memo={memo}
              isSelected={memo.id === selectedMemoId}
              onSelect={() => onSelectMemo(memo.id)}
              onDelete={() => onDeleteMemo(memo.id)}
              onTogglePin={() => onTogglePin(memo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MemoItem({
  memo,
  isSelected,
  onSelect,
  onDelete,
  onTogglePin,
}: {
  memo: Memo;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${memo.title}" 메모를 삭제하시겠습니까?`)) {
      onDelete();
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin();
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative px-3 py-2.5 rounded-xl cursor-pointer transition border
        ${isSelected
          ? 'bg-[#FACC15] text-amber-950 shadow-sm border-amber-400 font-medium'
          : 'bg-[#FEFCE8] hover:bg-[#FEF08A]/70 text-amber-900 border-amber-200/60 hover:shadow-xs'
        }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {memo.isPinned && (
              <Pin size={11} className={isSelected ? 'text-amber-900 fill-amber-900' : 'text-amber-600 fill-amber-500'} />
            )}
            <p className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-950' : 'text-amber-900'}`}>
              {memo.title || '제목 없음'}
            </p>
          </div>
          <p className={`text-[11px] truncate leading-relaxed ${isSelected ? 'text-amber-900/90' : 'text-amber-800/70'}`}>
            {memo.plainTextPreview || '내용 없음'}
          </p>
          <p className={`text-[10px] mt-1 ${isSelected ? 'text-amber-900/70' : 'text-amber-700/60'}`}>
            {format(new Date(memo.updatedAt), 'MM.dd HH:mm', { locale: ko })}
          </p>
        </div>
        {/* Action buttons */}
        {(hovered || isSelected) && (
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={handlePin}
              title={memo.isPinned ? '핀 해제' : '핀 고정'}
              className={`p-1 rounded-md transition ${
                isSelected
                  ? 'hover:bg-amber-400 text-amber-900'
                  : 'hover:bg-amber-200 text-amber-600'
              }`}
            >
              <Pin size={11} />
            </button>
            <button
              onClick={handleDelete}
              title="삭제"
              className={`p-1 rounded-md transition ${
                isSelected
                  ? 'hover:bg-amber-400 text-red-700'
                  : 'hover:bg-red-100 text-amber-700 hover:text-red-600'
              }`}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
