'use client';

import { useState, useMemo } from 'react';
import { TodoItem, CalendarDay } from '@/types/calendar';
import { getLunarDate } from '@/lib/lunar';
import { getSolarHoliday, getLunarHoliday } from '@/lib/holidays';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Download, GripVertical } from 'lucide-react';
import TodoModal from './TodoModal';
import { getTodosForDate, updateTodo } from '@/lib/storage';
import { COLOR_CLASSES } from './TodoModal';

interface CalendarViewProps {
  todos: TodoItem[];
  onTodosChange: (newTodos: TodoItem[]) => void;
}

export default function CalendarView({ todos, onTodosChange }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return days.map((date): CalendarDay => {
      const lunar = getLunarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayLunar = getLunarDate(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate());
      const isDayBeforeSeollal = nextDayLunar.month === 1 && nextDayLunar.day === 1 && !nextDayLunar.isLeapMonth;

      const solarHoliday = getSolarHoliday(date.getMonth() + 1, date.getDate());
      const lunarHoliday = getLunarHoliday(lunar.month, lunar.day, lunar.isLeapMonth, isDayBeforeSeollal);
      const holiday = solarHoliday || lunarHoliday;

      return {
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: isToday(date),
        dayOfWeek: date.getDay(),
        lunar: {
          year: lunar.year,
          month: lunar.month,
          day: lunar.day,
          isLeapMonth: lunar.isLeapMonth,
          text: lunar.text,
        },
        holiday,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, month]);

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Drag and Drop handler
  const handleDrop = (targetDate: string, rawPayload: string) => {
    try {
      const data = JSON.parse(rawPayload);
      const { todoId, fromDate } = data;
      if (!todoId || targetDate === fromDate) return;

      const todoToMove = todos.find((t) => t.id === todoId);
      if (!todoToMove) return;

      let updatedDates: string[] = [];
      if (todoToMove.dates && todoToMove.dates.length > 0) {
        updatedDates = todoToMove.dates.map((d) => (d === fromDate ? targetDate : d));
        if (!updatedDates.includes(targetDate)) {
          updatedDates.push(targetDate);
        }
      } else {
        updatedDates = [targetDate];
      }

      const updated = updateTodo(todos, todoId, {
        date: targetDate,
        dates: updatedDates,
      });
      onTodosChange(updated);
    } catch (err) {
      console.error('Failed to handle drop:', err);
    }
  };

  // Export Calendar to standalone HTML
  const handleExportCalendarHTML = () => {
    const monthTitle = format(currentDate, 'yyyy년 M월', { locale: ko });
    const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];

    let rowsHtml = '';
    weeks.forEach((week) => {
      rowsHtml += '<tr>';
      week.forEach((day) => {
        const dayTodos = getTodosForDate(todos, day.dateString);
        const isSun = day.dayOfWeek === 0;
        const isSat = day.dayOfWeek === 6;
        const isHoli = !!day.holiday;
        const numColor = isHoli || isSun ? '#e11d48' : isSat ? '#2563eb' : day.isCurrentMonth ? '#1e293b' : '#94a3b8';
        const cellBg = day.isCurrentMonth ? '#ffffff' : '#f8fafc';

        let todosHtml = '';
        dayTodos.forEach((t) => {
          todosHtml += `<div style="margin-top: 4px; padding: 3px 6px; font-size: 11px; background: #eff6ff; color: #1d4ed8; border-radius: 4px; border: 1px solid #bfdbfe;">
            <b>${t.time}</b> ${t.title} ${t.completed ? '(완료)' : ''}
          </div>`;
        });

        rowsHtml += `<td style="vertical-align: top; width: 14.28%; height: 120px; padding: 8px; border: 1px solid #e2e8f0; background: ${cellBg};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 14px; color: ${numColor};">${day.dayNumber}</span>
            <span style="font-size: 10px; color: #b45309;">${day.isCurrentMonth ? day.lunar.text : ''}</span>
          </div>
          ${day.holiday ? `<div style="font-size: 10px; color: #e11d48; font-weight: bold; margin-top: 2px;">${day.holiday}</div>` : ''}
          <div>${todosHtml}</div>
        </td>`;
      });
      rowsHtml += '</tr>';
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>HyunsCalendar - ${monthTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
    h1 { text-align: center; margin-bottom: 20px; font-size: 24px; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th { padding: 10px; background: #f1f5f9; border: 1px solid #cbd5e1; font-size: 13px; font-weight: bold; }
    th.sun { color: #e11d48; }
    th.sat { color: #2563eb; }
    .footer { margin-top: 16px; font-size: 12px; color: #64748b; text-align: right; }
  </style>
</head>
<body>
  <h1>${monthTitle} 달력</h1>
  <table>
    <thead>
      <tr>
        ${dayHeaders.map((h, i) => `<th class="${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer">HyunsCalendar 인쇄 및 저장본 | 생성 시각: ${new Date().toLocaleString('ko-KR')}</div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar_${year}_${String(month + 1).padStart(2, '0')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedDayObj = selectedDate ? calendarDays.find((d) => d.dateString === selectedDate) : null;
  const selectedDayTodos = selectedDate ? getTodosForDate(todos, selectedDate) : [];

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Calendar Header */}
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-gray-800 tracking-tight">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleExportCalendarHTML}
            title="현재 달력 HTML로 내보내기 (다운로드)"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-blue-200 hover:border-blue-400 bg-blue-50/70 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition"
          >
            <Download size={13} />
            달력 HTML 내보내기
          </button>
          <button
            onClick={goToday}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition"
          >
            오늘
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/70">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            className={`py-2.5 text-center text-xs font-bold
              ${idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-gray-700'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Height is 2x: min-h-[160px] per cell */}
      <div className="flex-1 overflow-y-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-200">
            {week.map((day) => {
              const dayTodos = getTodosForDate(todos, day.dateString);
              const isSelected = day.dateString === selectedDate;
              const isHoliday = !!day.holiday;
              const isSun = day.dayOfWeek === 0;
              const isSat = day.dayOfWeek === 6;
              const isDragTarget = dragOverDate === day.dateString;

              const dayTextColor = isHoliday || isSun
                ? 'text-rose-600'
                : isSat
                ? 'text-blue-600'
                : day.isCurrentMonth
                ? 'text-gray-900'
                : 'text-gray-300';

              return (
                <div
                  key={day.dateString}
                  onClick={() => setSelectedDate(day.dateString)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverDate !== day.dateString) setDragOverDate(day.dateString);
                  }}
                  onDragLeave={() => {
                    if (dragOverDate === day.dateString) setDragOverDate(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDate(null);
                    const raw = e.dataTransfer.getData('text/plain');
                    handleDrop(day.dateString, raw);
                  }}
                  className={`group relative p-2 min-h-[160px] cursor-pointer transition border-r border-gray-100 last:border-r-0 flex flex-col
                    ${!day.isCurrentMonth ? 'bg-gray-50/40 text-gray-400' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : 'hover:bg-gray-50/80'}
                    ${isDragTarget ? 'bg-blue-100/70 ring-2 ring-dashed ring-blue-500' : ''}
                  `}
                >
                  {/* Day header: number, lunar date, plus button */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${dayTextColor}
                          ${day.isToday ? 'bg-blue-600 text-white shadow-xs' : ''}`}
                      >
                        {day.dayNumber}
                      </div>
                      {/* Lunar Date badge */}
                      {day.isCurrentMonth && (
                        <span className={`text-[10px] font-medium leading-none ${day.lunar.isLeapMonth ? 'text-amber-600 font-bold' : 'text-amber-700/80'}`}>
                          {day.lunar.text}
                          {day.lunar.isLeapMonth && '(윤)'}
                        </span>
                      )}
                    </div>
                    {/* Add (+) Button */}
                    {day.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day.dateString);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white flex items-center justify-center transition shadow-xs"
                        title="이 날짜에 할일 추가"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>

                  {/* Holiday title */}
                  {day.holiday && (
                    <div className="text-[10px] text-rose-600 font-bold mt-1 truncate">
                      {day.holiday}
                    </div>
                  )}

                  {/* Lunar month start */}
                  {day.lunar.day === 1 && day.isCurrentMonth && !day.holiday && (
                    <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      음{day.lunar.isLeapMonth ? '(윤)' : ''}{day.lunar.month}월 초하루
                    </div>
                  )}

                  {/* Todo list items with DRAG AND DROP */}
                  <div className="mt-2 space-y-1 flex-1 overflow-y-auto max-h-[110px]">
                    {dayTodos.map((todo) => {
                      const cc = COLOR_CLASSES[todo.color || 'blue'];
                      return (
                        <div
                          key={todo.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData(
                              'text/plain',
                              JSON.stringify({ todoId: todo.id, fromDate: day.dateString })
                            );
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day.dateString);
                          }}
                          title="마우스로 잡아서 다른 날짜로 옮길 수 있습니다"
                          className={`text-[10px] px-1.5 py-1 rounded-md leading-tight flex items-center gap-1 cursor-grab active:cursor-grabbing select-none transition shadow-xs border
                            ${todo.completed ? 'opacity-50 line-through bg-gray-100 text-gray-500 border-gray-200' : `${cc.light} ${cc.text}`}
                            hover:scale-[1.02] hover:shadow-sm`}
                        >
                          <GripVertical size={10} className="opacity-40 shrink-0" />
                          <span className="font-bold shrink-0">{todo.time}</span>
                          <span className="truncate flex-1">{todo.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>오늘</span>
          <span className="flex items-center gap-1.5 text-amber-700 font-medium">음력 날짜</span>
          <span className="flex items-center gap-1.5 text-rose-600 font-medium">공휴일 / 일요일</span>
        </div>
        <span className="text-[11px] text-gray-400 hidden sm:inline">
          💡 할일 카드를 마우스로 드래그하여 다른 날짜로 이동할 수 있습니다
        </span>
      </div>

      {/* Todo Modal */}
      {selectedDate && selectedDayObj && (
        <TodoModal
          date={selectedDate}
          lunarText={selectedDayObj.lunar.text}
          todos={selectedDayTodos}
          allTodos={todos}
          onClose={() => setSelectedDate(null)}
          onTodosChange={onTodosChange}
        />
      )}
    </div>
  );
}
