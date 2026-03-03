import { Download, Filter, Printer, Share2, X } from "lucide-react";
import React, { useState, useMemo } from "react";
import type { Expense } from "../backend";
import { filterByDateRange, sumExpenses } from "../utils/analytics";
import {
  CATEGORIES,
  PAYMENT_MODES,
  getCategoryConfig,
} from "../utils/categoryConfig";
import {
  copyToClipboard,
  formatTextSummary,
  triggerCSVDownload,
} from "../utils/exportUtils";
import {
  formatDate,
  formatIndianRupee,
  getTodayString,
} from "../utils/formatters";
import { useToast } from "./Toast";

interface ReportsProps {
  expenses: Expense[];
}

export function Reports({ expenses }: ReportsProps) {
  const { showToast } = useToast();
  const today = getTodayString();
  const firstOfMonth = `${today.substring(0, 8)}01`;

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("All");
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    let result = filterByDateRange(expenses, fromDate, toDate);
    if (selectedCategories.length > 0) {
      result = result.filter((e) => selectedCategories.includes(e.category));
    }
    if (selectedPayment !== "All") {
      result = result.filter((e) => e.paymentMode === selectedPayment);
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, fromDate, toDate, selectedCategories, selectedPayment]);

  const total = useMemo(() => sumExpenses(filtered), [filtered]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleCSV = () => {
    triggerCSVDownload(filtered);
    showToast("CSV downloaded successfully!", "success");
  };

  const handleShare = async () => {
    const text = formatTextSummary(filtered);
    const ok = await copyToClipboard(text);
    showToast(
      ok ? "Report copied to clipboard!" : "Failed to copy",
      ok ? "success" : "error",
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-24">
      <div className="bg-gk-primary px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Reports</h1>
          <button
            type="button"
            onClick={() => setShowFilters((f) => !f)}
            className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-white text-sm font-semibold"
          >
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card space-y-4">
            <h3 className="text-gk-text dark:text-white font-bold text-sm">
              Filter Expenses
            </h3>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="report-from-date"
                  className="block text-xs font-semibold text-gk-text-secondary mb-1"
                >
                  From
                </label>
                <input
                  id="report-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-gk-text dark:text-white text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-gk-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="report-to-date"
                  className="block text-xs font-semibold text-gk-text-secondary mb-1"
                >
                  To
                </label>
                <input
                  id="report-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-gk-text dark:text-white text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-gk-accent"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gk-text-secondary">
                  Categories
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-gk-accent font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selectedCategories.includes(cat.name)
                        ? "bg-gk-accent border-gk-accent text-white"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gk-text-secondary"
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <span className="block text-xs font-semibold text-gk-text-secondary mb-2">
                Payment Mode
              </span>
              <div className="flex flex-wrap gap-2">
                {["All", ...PAYMENT_MODES].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setSelectedPayment(mode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selectedPayment === mode
                        ? "bg-gk-primary border-gk-primary text-white"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gk-text-secondary"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gk-primary rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-300 text-xs font-semibold">Total Amount</p>
            <p className="text-white text-2xl font-bold">
              {formatIndianRupee(total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-300 text-xs font-semibold">Transactions</p>
            <p className="text-white text-2xl font-bold">{filtered.length}</p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Printer size={18} className="text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-gk-text-secondary">
              PDF/Print
            </span>
          </button>
          <button
            type="button"
            onClick={handleCSV}
            className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Download size={18} className="text-gk-accent" />
            </div>
            <span className="text-xs font-semibold text-gk-text-secondary">
              CSV Export
            </span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Share2 size={18} className="text-purple-500" />
            </div>
            <span className="text-xs font-semibold text-gk-text-secondary">
              Share
            </span>
          </button>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-gk-text dark:text-white font-bold text-sm">
              {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gk-text dark:text-white font-semibold">
                No expenses found
              </p>
              <p className="text-gk-text-secondary text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((expense) => {
                const cfg = getCategoryConfig(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: cfg.bgColor }}
                    >
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gk-text dark:text-white text-sm font-semibold">
                        {expense.category}
                      </p>
                      <p className="text-gk-text-secondary text-xs">
                        {formatDate(expense.date)} · {expense.paymentMode}
                      </p>
                      {expense.notes && (
                        <p className="text-gk-text-secondary text-xs truncate">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    <p className="text-gk-text dark:text-white font-bold text-sm shrink-0">
                      {formatIndianRupee(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
