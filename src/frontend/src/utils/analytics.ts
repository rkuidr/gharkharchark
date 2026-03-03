import type { Expense } from "../backend";

export function filterByMonth(
  expenses: Expense[],
  year: number,
  month: number,
): Expense[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return expenses.filter((e) => e.date.startsWith(prefix));
}

export function filterByYear(expenses: Expense[], year: number): Expense[] {
  return expenses.filter((e) => e.date.startsWith(String(year)));
}

export function filterByDate(expenses: Expense[], date: string): Expense[] {
  return expenses.filter((e) => e.date === date);
}

export function filterByDateRange(
  expenses: Expense[],
  from: string,
  to: string,
): Expense[] {
  return expenses.filter((e) => e.date >= from && e.date <= to);
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of expenses) {
    result[e.category] = (result[e.category] || 0) + e.amount;
  }
  return result;
}

export function groupByDay(
  expenses: Expense[],
  year: number,
  month: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  for (const e of expenses) {
    if (e.date.startsWith(prefix)) {
      const day = e.date.split("-")[2];
      result[day] = (result[day] || 0) + e.amount;
    }
  }
  return result;
}

export function groupByMonth(
  expenses: Expense[],
  year: number,
): Record<number, number> {
  const result: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) result[m] = 0;
  for (const e of expenses) {
    if (e.date.startsWith(String(year))) {
      const month = Number.parseInt(e.date.split("-")[1]);
      result[month] = (result[month] || 0) + e.amount;
    }
  }
  return result;
}

export function getTopCategory(
  expenses: Expense[],
): { name: string; amount: number } | null {
  const grouped = groupByCategory(expenses);
  const entries = Object.entries(grouped);
  if (entries.length === 0) return null;
  const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  return { name: top[0], amount: top[1] };
}

export function getPieChartData(
  expenses: Expense[],
): Array<{ name: string; value: number }> {
  const grouped = groupByCategory(expenses);
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

export function getDailyBarData(
  expenses: Expense[],
  year: number,
  month: number,
): Array<{ day: string; amount: number }> {
  const grouped = groupByDay(expenses, year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return { day: String(i + 1), amount: Math.round(grouped[day] || 0) };
  });
}

export function getMonthlyBarData(
  expenses: Expense[],
  year: number,
): Array<{ month: string; amount: number }> {
  const grouped = groupByMonth(expenses, year);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m, i) => ({
    month: m,
    amount: Math.round(grouped[i + 1] || 0),
  }));
}
