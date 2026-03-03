import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Expense {
    id: string;
    date: string;
    createdAt: bigint;
    notes: string;
    paymentMode: string;
    category: string;
    amount: number;
}
export interface Settings {
    pin: string;
    monthlyBudget: number;
    annualIncome: number;
    darkMode: boolean;
    pinEnabled: boolean;
}
export interface backendInterface {
    addExpense(expense: Expense): Promise<void>;
    deleteExpense(id: string): Promise<void>;
    getExpenses(): Promise<Array<Expense>>;
    getExpensesByCategory(category: string): Promise<Array<Expense>>;
    getSettings(): Promise<Settings>;
    updateExpense(expense: Expense): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
}
