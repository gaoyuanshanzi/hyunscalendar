// Korean National Holidays (양력 기준)
export const HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
};

// Lunar holidays (approximated by major lunar dates - handled separately in code)
export const LUNAR_HOLIDAYS: Record<string, string> = {
  '01-01': '설날',
  '01-14': '설날연휴',
  '01-02': '설날연휴',
  '04-08': '부처님오신날',
  '07-07': '칠석',
  '09-15': '추석',
  '09-14': '추석연휴',
  '09-16': '추석연휴',
};

export function getSolarHoliday(month: number, day: number): string | undefined {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return HOLIDAYS[key];
}

export function getLunarHoliday(lunarMonth: number, lunarDay: number): string | undefined {
  const key = `${String(lunarMonth).padStart(2, '0')}-${String(lunarDay).padStart(2, '0')}`;
  return LUNAR_HOLIDAYS[key];
}
