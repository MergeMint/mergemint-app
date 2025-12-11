// Date period utilities for bounty programs

export function getWeekPeriod(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  // Set to Monday of current week (or next Monday if today is Sunday)
  const day = start.getDay();
  const diff = day === 0 ? 1 : -(day - 1);
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getMonthPeriod(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getQuarterPeriod(date: Date = new Date()): { start: Date; end: Date } {
  const month = date.getMonth();
  const year = date.getFullYear();

  // Determine quarter start month (0, 3, 6, or 9)
  const quarterStartMonth = Math.floor(month / 3) * 3;

  const start = new Date(year, quarterStartMonth, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, quarterStartMonth + 3, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextPeriod(
  periodType: 'weekly' | 'monthly' | 'quarterly',
): { start: Date; end: Date } {
  const today = new Date();

  switch (periodType) {
    case 'weekly': {
      const nextMonday = new Date(today);
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      return getWeekPeriod(nextMonday);
    }
    case 'monthly': {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return getMonthPeriod(nextMonth);
    }
    case 'quarterly': {
      const currentQuarterStart = Math.floor(today.getMonth() / 3) * 3;
      const nextQuarter = new Date(today.getFullYear(), currentQuarterStart + 3, 1);
      return getQuarterPeriod(nextQuarter);
    }
  }
}
