/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Korean Lunar Calendar conversion helper (CJS module wrapped)

let calendarInstance: any = null;

function getCalendarInstance(): any {
  if (!calendarInstance) {
    const KoreanLunarCalendar = require('korean-lunar-calendar');
    calendarInstance = new KoreanLunarCalendar();
  }
  return calendarInstance;
}

export interface LunarResult {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  text: string; // e.g. "음 7.22"
  fullText: string;
}

export function getLunarDate(solarYear: number, solarMonth: number, solarDay: number): LunarResult {
  try {
    const cal = getCalendarInstance();
    cal.setSolarDate(solarYear, solarMonth, solarDay);
    const lunar = cal.getLunarCalendar();
    const isLeap = !!lunar.intercalation;
    const prefix = isLeap ? '윤' : '음';
    const text = `${prefix} ${lunar.month}.${lunar.day}`;
    const fullText = `${prefix}력 ${lunar.year}년 ${lunar.month}월 ${lunar.day}일`;
    return {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeapMonth: isLeap,
      text,
      fullText,
    };
  } catch (err) {
    console.error('Error converting lunar date:', err);
    return {
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      isLeapMonth: false,
      text: `음 ${solarMonth}.${solarDay}`,
      fullText: '',
    };
  }
}
