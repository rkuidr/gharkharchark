import type { Expense } from "../backend";
import { getCategoryConfig } from "./categoryConfig";
import { formatDate, formatIndianRupee } from "./formatters";

export function generateCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Amount (INR)", "Payment Mode", "Notes"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    Math.round(e.amount).toString(),
    e.paymentMode,
    `"${e.notes.replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function triggerCSVDownload(
  expenses: Expense[],
  filename = "familyexpense-report.csv",
): void {
  const csv = generateCSV(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatTextSummary(expenses: Expense[]): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const lines = [
    "FamilyExpense – Expense Report",
    `Total: ${formatIndianRupee(total)} (${expenses.length} transactions)`,
    "",
    ...expenses.map((e) => {
      const cfg = getCategoryConfig(e.category);
      return `${cfg.emoji} ${formatDate(e.date)} | ${e.category} | ${formatIndianRupee(e.amount)} | ${e.paymentMode}${e.notes ? ` | ${e.notes}` : ""}`;
    }),
  ];
  return lines.join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
