import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Expense, Settings } from "../backend";

// --------------- localStorage helpers ---------------

function expensesKey(userId: string) {
  return `ghk_expenses_${userId}`;
}

function settingsKey(userId: string) {
  return `ghk_settings_${userId}`;
}

function readExpenses(userId: string): Expense[] {
  try {
    const raw = localStorage.getItem(expensesKey(userId));
    if (raw) return JSON.parse(raw) as Expense[];
  } catch {
    // ignore
  }
  return seedExpenses(userId);
}

function writeExpenses(userId: string, expenses: Expense[]): void {
  localStorage.setItem(expensesKey(userId), JSON.stringify(expenses));
}

function readSettings(userId: string): Settings {
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    if (raw) return JSON.parse(raw) as Settings;
  } catch {
    // ignore
  }
  return defaultSettings();
}

function writeSettings(userId: string, settings: Settings): void {
  localStorage.setItem(settingsKey(userId), JSON.stringify(settings));
}

function defaultSettings(): Settings {
  return {
    monthlyBudget: 20000,
    annualIncome: 300000,
    darkMode: false,
    pinEnabled: false,
    pin: "",
  };
}

function seedExpenses(userId: string): Expense[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const pm =
    String(now.getMonth()).padStart(2, "0") === "00"
      ? "12"
      : String(now.getMonth()).padStart(2, "0");
  const pmYear = now.getMonth() === 0 ? y - 1 : y;

  const makeDate = (yy: number, mm: string, dd: number) =>
    `${yy}-${mm}-${String(dd).padStart(2, "0")}`;

  const expenses: Expense[] = [
    {
      id: crypto.randomUUID(),
      amount: 8500,
      category: "Rent",
      date: makeDate(y, m, 1),
      paymentMode: "Bank Transfer",
      notes: "Monthly rent",
      createdAt: BigInt(Date.now() - 25 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 3200,
      category: "Grocery",
      date: makeDate(y, m, 3),
      paymentMode: "UPI",
      notes: "Weekly grocery shopping",
      createdAt: BigInt(Date.now() - 20 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 1450,
      category: "Electricity",
      date: makeDate(y, m, 5),
      paymentMode: "UPI",
      notes: "BSES bill",
      createdAt: BigInt(Date.now() - 18 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 6000,
      category: "EMI",
      date: makeDate(y, m, 7),
      paymentMode: "Auto Debit",
      notes: "Car loan EMI",
      createdAt: BigInt(Date.now() - 16 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 2800,
      category: "School Fees",
      date: makeDate(y, m, 10),
      paymentMode: "Cheque",
      notes: "Arjun's school fees",
      createdAt: BigInt(Date.now() - 13 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 850,
      category: "Medical",
      date: makeDate(y, m, 12),
      paymentMode: "Cash",
      notes: "Pharmacy medicines",
      createdAt: BigInt(Date.now() - 11 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 450,
      category: "Gas",
      date: makeDate(y, m, 14),
      paymentMode: "Cash",
      notes: "LPG cylinder",
      createdAt: BigInt(Date.now() - 9 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 1200,
      category: "Travel",
      date: makeDate(y, m, 16),
      paymentMode: "UPI",
      notes: "Metro + auto",
      createdAt: BigInt(Date.now() - 7 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 2400,
      category: "Shopping",
      date: makeDate(y, m, 18),
      paymentMode: "Credit Card",
      notes: "Clothes for festival",
      createdAt: BigInt(Date.now() - 5 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 320,
      category: "Water",
      date: makeDate(y, m, 20),
      paymentMode: "UPI",
      notes: "Water tanker",
      createdAt: BigInt(Date.now() - 3 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 1800,
      category: "Grocery",
      date: makeDate(pmYear, pm, 15),
      paymentMode: "UPI",
      notes: "Vegetables and fruits",
      createdAt: BigInt(Date.now() - 40 * 86400000),
    },
    {
      id: crypto.randomUUID(),
      amount: 5500,
      category: "Rent",
      date: makeDate(pmYear, pm, 1),
      paymentMode: "Bank Transfer",
      notes: "Previous month rent",
      createdAt: BigInt(Date.now() - 55 * 86400000),
    },
  ];

  writeExpenses(userId, expenses);
  return expenses;
}

// --------------- Hooks ---------------

export function useLocalExpenses(userId: string | null) {
  return useQuery<Expense[]>({
    queryKey: ["local-expenses", userId],
    queryFn: () => {
      if (!userId) return [];
      return readExpenses(userId);
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useLocalSettings(userId: string | null) {
  return useQuery<Settings>({
    queryKey: ["local-settings", userId],
    queryFn: () => {
      if (!userId) return defaultSettings();
      return readSettings(userId);
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useLocalAddExpense(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      if (!userId) throw new Error("Not logged in");
      const expenses = readExpenses(userId);
      writeExpenses(userId, [...expenses, expense]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-expenses", userId] });
    },
  });
}

export function useLocalUpdateExpense(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      if (!userId) throw new Error("Not logged in");
      const expenses = readExpenses(userId);
      writeExpenses(
        userId,
        expenses.map((e) => (e.id === expense.id ? expense : e)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-expenses", userId] });
    },
  });
}

export function useLocalDeleteExpense(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not logged in");
      const expenses = readExpenses(userId);
      writeExpenses(
        userId,
        expenses.filter((e) => e.id !== id),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-expenses", userId] });
    },
  });
}

export function useLocalUpdateSettings(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!userId) throw new Error("Not logged in");
      writeSettings(userId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-settings", userId] });
    },
  });
}
