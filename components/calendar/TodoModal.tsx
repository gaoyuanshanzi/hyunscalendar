'use client';

import { useState } from 'react';
import { TodoItem } from '@/types/calendar';
import { createTodo, updateTodo, deleteTodo, getTodosForDate } from '@/lib/storage';
import { X, Plus, Clock, Trash2, CheckCircle, Circle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TodoModalProps {
  date: string; // YYYY-MM-DD
  lunarText: string;
  todos: TodoItem[];
  onClose: () => void;
  onTodosChange: (newTodos: TodoItem[]) => void;
  allTodos: TodoItem[];
}

const COLOR_OPTIONS = [
  { value: 'blue', label: '파란색', className: 'bg-blue-500' },
  { value: 'emerald', label: '초록색', className: 'bg-emerald-500' },
  { value: 'amber', label: '노란색', className: 'bg-amber-500' },
  { value: 'rose', label: '빨간색', className: 'bg-rose-500' },
  { value: 'purple', label: '보라색', className: 'bg-purple-500' },
  { value: 'gray', label: '회색', className: 'bg-gray-400' },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50 border-blue-200' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50 border-emerald-200' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50 border-amber-200' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50 border-rose-200' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50 border-purple-200' },
  gray: { bg: 'bg-gray-400', text: 'text-gray-700', light: 'bg-gray-50 border-gray-200' },
};

export { COLOR_CLASSES };

export default function TodoModal({
  date,
  lunarText,
  todos,
  onClose,
  onTodosChange,
  allTodos,
}: TodoModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [time, setTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  const parsedDate = new Date(date + 'T00:00:00');
  const dateDisplay = format(parsedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko });

  const resetForm = () => {
    setTime('09:00');
    setTitle('');
    setDescription('');
    setColor('blue');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    let updated: TodoItem[];
    if (editingId) {
      updated = updateTodo(allTodos, editingId, { time, title, description, color });
    } else {
      const newTodo = createTodo(date, time, title.trim(), description.trim() || undefined, color);
      updated = [...allTodos, newTodo];
    }
    onTodosChange(updated);
    resetForm();
  };

  const handleEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setTime(todo.time);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setColor(todo.color || 'blue');
    setShowForm(true);
  };

  const handleToggle = (id: string) => {
    const todo = allTodos.find((t) => t.id === id);
    if (!todo) return;
    const updated = updateTodo(allTodos, id, { completed: !todo.completed });
    onTodosChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deleteTodo(allTodos, id);
    onTodosChange(updated);
  };

  const sortedTodos = getTodosForDate(todos, date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{dateDisplay}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{lunarText}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {sortedTodos.length === 0 && !showForm && (
            <div className="text-center py-8 text-gray-400">
              <Clock size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">이 날의 일정이 없습니다</p>
            </div>
          )}
          {sortedTodos.map((todo) => {
            const cc = COLOR_CLASSES[todo.color || 'blue'];
            return (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  todo.completed ? 'bg-gray-50 border-gray-100 opacity-60' : `${cc.light}`
                }`}
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="mt-0.5 shrink-0"
                >
                  {todo.completed
                    ? <CheckCircle size={18} className="text-emerald-500" />
                    : <Circle size={18} className={cc.text} />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${cc.text} flex items-center gap-1`}>
                      <Clock size={11} />
                      {todo.time}
                    </span>
                  </div>
                  <p className={`text-sm font-medium mt-0.5 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{todo.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              {editingId ? '일정 수정' : '새 일정 추가'}
            </p>
            <div className="space-y-2">
              {/* Time picker */}
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400 shrink-0" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                {/* Color picker */}
                <div className="flex gap-1 ml-auto">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-5 h-5 rounded-full ${c.className} transition ${
                        color === c.value ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="일정 제목 *"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
              {/* Description */}
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="메모 (선택사항)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition"
                >
                  {editingId ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!showForm && (
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
            >
              <Plus size={16} />
              일정 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
