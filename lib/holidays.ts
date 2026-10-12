// Korean National Holidays (양력 기준 법정 공휴일)
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

// Korean Lunar Public Holidays (음력 기준 법정 공휴일)
// 설날: 음력 1월 1일 및 전후일
// 부처님오신날: 음력 4월 8일
// 추석: 음력 8월 15일 및 전후일 (음력 8.14, 8.15, 8.16)
export const LUNAR_HOLIDAYS: Record<string, string> = {
  '01-01': '설날',
  '01-02': '설날연휴',
  '04-08': '부처님오신날',
  '08-14': '추석연휴',
  '08-15': '추석',
  '08-16': '추석연휴',
};

export function getSolarHoliday(month: number, day: number): string | undefined {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return HOLIDAYS[key];
}

export function getLunarHoliday(
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth?: boolean,
  isDayBeforeSeollal?: boolean
): string | undefined {
  // 윤달에는 법정 명절 공휴일이 적용되지 않음
  if (isLeapMonth) return undefined;
  // 설날 전날 (음력 12월 말일)
  if (isDayBeforeSeollal) return '설날연휴';
  const key = `${String(lunarMonth).padStart(2, '0')}-${String(lunarDay).padStart(2, '0')}`;
  return LUNAR_HOLIDAYS[key];
}
