'use client';

import { useState, useMemo } from 'react';
import { TodoItem, CalendarDay } from '@/types/calendar';
import { getLunarDate } from '@/lib/lunar';
import { getSolarHoliday, getLunarHoliday } from '@/lib/holidays';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';
import TodoModal from './TodoModal';
import { getTodosForDate } from '@/lib/storage';
import { COLOR_CLASSES } from './TodoModal';

interface CalendarViewProps {
  todos: TodoItem[];
  onTodosChange: (newTodos: TodoItem[]) => void;
}

export default function CalendarView({ todos, onTodosChange }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
      const solarHoliday = getSolarHoliday(date.getMonth() + 1, date.getDate());
      const lunarHoliday = getLunarHoliday(lunar.month, lunar.day);
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

  const selectedDayObj = selectedDate ? calendarDays.find((d) => d.dateString === selectedDate) : null;
  const selectedDayTodos = selectedDate ? getTodosForDate(todos, selectedDate) : [];

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Calendar Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={15} className="text-blue-500" />
          <h2 className="text-sm font-bold text-gray-800">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
          >
            오늘
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold
              ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100">
            {week.map((day) => {
              const dayTodos = getTodosForDate(todos, day.dateString);
              const isSelected = day.dateString === selectedDate;
              const isHoliday = !!day.holiday;
              const isSun = day.dayOfWeek === 0;
              const isSat = day.dayOfWeek === 6;

              const dayTextColor = isHoliday || isSun
                ? 'text-rose-500'
                : isSat
                ? 'text-blue-500'
                : day.isCurrentMonth
                ? 'text-gray-800'
                : 'text-gray-300';

              return (
                <div
                  key={day.dateString}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`relative p-1.5 min-h-[80px] cursor-pointer transition border-r border-gray-50 last:border-r-0
                    ${!day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${dayTextColor}
                        ${day.isToday ? 'bg-blue-600 text-white' : ''}`}
                    >
                      {day.dayNumber}
                    </div>
                    {/* + button */}
                    {day.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day.dateString);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-500 text-blue-600 hover:text-white flex items-center justify-center transition"
                        title="일정 추가"
                      >
                        <Plus size={10} />
                      </button>
                    )}
                  </div>

                  {/* Lunar date */}
                  <div className="mt-0.5 text-[9px] text-gray-400 leading-none">
                    {day.isCurrentMonth && (
                      <span className={day.lunar.isLeapMonth ? 'text-amber-500' : ''}>
                        {day.lunar.text.replace('음 ', '')}
                        {day.lunar.isLeapMonth && '(윤)'}
                      </span>
                    )}
                  </div>

                  {/* Holiday name */}
                  {day.holiday && (
                    <div className="text-[9px] text-rose-400 font-medium truncate">
                      {day.holiday}
                    </div>
                  )}

                  {/* Lunar day 1 (month start) */}
                  {day.lunar.day === 1 && day.isCurrentMonth && !day.holiday && (
                    <div className="text-[9px] text-amber-500 font-medium">
                      음{day.lunar.isLeapMonth ? '(윤)' : ''}{day.lunar.month}월
                    </div>
                  )}

                  {/* Todo items */}
                  <div className="mt-1 space-y-0.5">
                    {dayTodos.slice(0, 3).map((todo) => {
                      const cc = COLOR_CLASSES[todo.color || 'blue'];
                      return (
                        <div
                          key={todo.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate leading-tight
                            ${todo.completed ? 'opacity-50 line-through' : ''}
                            ${cc.light} ${cc.text}`}
                        >
                          {todo.time} {todo.title}
                        </div>
                      );
                    })}
                    {dayTodos.length > 3 && (
                      <div className="text-[9px] text-gray-400 px-1">+{dayTodos.length - 3} 더</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>오늘</span>
        <span className="flex items-center gap-1 text-amber-500">음력</span>
        <span className="flex items-center gap-1 text-rose-500">공휴일/일요일</span>
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
