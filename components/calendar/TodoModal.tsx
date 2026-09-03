'use client';

import { useState } from 'react';
import { TodoItem } from '@/types/calendar';
import { createTodo, updateTodo, deleteTodo, getTodosForDate } from '@/lib/storage';
import { X, Plus, Clock, Trash2, CheckCircle, Circle, Edit2, Calendar, CalendarPlus } from 'lucide-react';
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
  const [selectedDates, setSelectedDates] = useState<string[]>([date]);
  const [extraDateInput, setExtraDateInput] = useState('');

  const parsedDate = new Date(date + 'T00:00:00');
  const dateDisplay = format(parsedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko });

  const resetForm = () => {
    setTime('09:00');
    setTitle('');
    setDescription('');
    setColor('blue');
    setSelectedDates([date]);
    setExtraDateInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddDate = (newDate: string) => {
    if (newDate && !selectedDates.includes(newDate)) {
      setSelectedDates((prev) => [...prev, newDate].sort());
      setExtraDateInput('');
    }
  };

  const handleRemoveDate = (dateToRemove: string) => {
    if (selectedDates.length <= 1) {
      alert('최소 하나의 날짜는 선택되어 있어야 합니다.');
      return;
    }
    setSelectedDates((prev) => prev.filter((d) => d !== dateToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const finalDates = selectedDates.length > 0 ? selectedDates : [date];
    const primaryDate = finalDates[0];

    let updated: TodoItem[];
    if (editingId) {
      updated = updateTodo(allTodos, editingId, {
        date: primaryDate,
        dates: finalDates,
        time,
        title: title.trim(),
        description: description.trim() || undefined,
        color,
      });
    } else {
      const newTodo = createTodo(
        primaryDate,
        time,
        title.trim(),
        description.trim() || undefined,
        color,
        finalDates
      );
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
    setSelectedDates(todo.dates && todo.dates.length > 0 ? todo.dates : [todo.date]);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-blue-50/50 to-white">
          <div>
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              {dateDisplay}
            </h3>
            <p className="text-xs text-amber-700 font-medium mt-0.5">{lunarText}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {sortedTodos.length === 0 && !showForm && (
            <div className="text-center py-10 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm font-medium text-gray-500">이 날의 일정이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">아래 [일정 추가] 버튼을 눌러 시간을 지정하고 할일을 등록하세요</p>
            </div>
          )}
          {sortedTodos.map((todo) => {
            const cc = COLOR_CLASSES[todo.color || 'blue'];
            const hasMultipleDates = todo.dates && todo.dates.length > 1;
            return (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition ${
                  todo.completed ? 'bg-gray-50 border-gray-100 opacity-60' : `${cc.light}`
                }`}
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="mt-0.5 shrink-0 hover:scale-110 transition"
                >
                  {todo.completed
                    ? <CheckCircle size={20} className="text-emerald-500 fill-emerald-100" />
                    : <Circle size={20} className={cc.text} />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${cc.text} flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-current/20`}>
                      <Clock size={11} />
                      {todo.time}
                    </span>
                    {hasMultipleDates && (
                      <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        다중날짜 ({todo.dates?.length}일)
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{todo.description}</p>
                  )}
                  {hasMultipleDates && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {todo.dates?.map((d) => (
                        <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${d === date ? 'bg-blue-200 text-blue-900 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(todo)}
                    title="수정"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    title="삭제"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/90 max-h-[50vh] overflow-y-auto">
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <CalendarPlus size={14} className="text-blue-600" />
              {editingId ? '일정 수정' : '새 일정 추가 (시간 선정 필수)'}
            </p>
            <div className="space-y-3">
              {/* Multi-date selection section */}
              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  적용 날짜 (다중 날짜 선택 가능)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedDates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-medium font-mono"
                    >
                      {d}
                      {selectedDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDate(d)}
                          className="hover:text-red-600 ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={extraDateInput}
                    onChange={(e) => setExtraDateInput(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDate(extraDateInput)}
                    disabled={!extraDateInput}
                    className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg disabled:opacity-40 transition"
                  >
                    + 날짜 추가
                  </button>
                </div>
              </div>

              {/* Time and Color picker */}
              <div className="flex items-center gap-2 flex-wrap bg-white p-2.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">시간*:</span>
                  <input
                    type="time"
                    value={time}
                    required
                    onChange={(e) => setTime(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
                  />
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[11px] text-gray-500 mr-1">색상:</span>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-5 h-5 rounded-full ${c.className} transition ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-60 hover:opacity-100'
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
                placeholder="일정 제목 (예: 팀 회의, 병원 방문 등) *"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />

              {/* Description */}
              <textarea
                value={description}
                rows={2}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상세 내용이나 메모 (선택 사항)"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!title.trim() || !time}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {editingId ? '일정 수정 완료' : '일정 저장'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Add Button */}
        {!showForm && (
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <Plus size={16} />
              새 일정 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
