export interface TodoItem {
  id: string;
  date: string; // Primary YYYY-MM-DD
  dates?: string[]; // Array of YYYY-MM-DD for multi-date selection
  time: string; // HH:mm (e.g. "09:30", "14:00")
  title: string;
  description?: string;
  completed: boolean;
  color?: string; // e.g. "blue", "emerald", "amber", "rose", "purple", "gray"
  createdAt: string;
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  text: string; // e.g. "음 7.18" or "윤 7.18"
}

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  lunar: LunarDate;
  holiday?: string;
}
