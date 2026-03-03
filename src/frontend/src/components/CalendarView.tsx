import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import type { Expense } from "../backend";
import { useDeleteExpense } from "../hooks/useQueries";
import { filterByDate, sumExpenses } from "../utils/analytics";
import { getCategoryConfig } from "../utils/categoryConfig";
import {
  formatDate,
  formatIndianRupee,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "../utils/formatters";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

interface CalendarViewProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
}

export function CalendarView({ expenses, onEditExpense }: CalendarViewProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();
  const deleteExpense = useDeleteExpense();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const monthLabel = useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[viewMonth - 1]} ${viewYear}`;
  }, [viewYear, viewMonth]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const prefix = `${viewYear}-${String(viewMonth).padStart(2, "0")}`;
    for (const e of expenses) {
      if (e.date.startsWith(prefix)) {
        totals[e.date] = (totals[e.date] || 0) + e.amount;
      }
    }
    return totals;
  }, [expenses, viewYear, viewMonth]);

  const selectedExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return filterByDate(expenses, selectedDate);
  }, [expenses, selectedDate]);

  const selectedTotal = useMemo(
    () => sumExpenses(selectedExpenses),
    [selectedExpenses],
  );

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else setViewMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else setViewMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense.mutateAsync(deleteId);
      showToast("Expense deleted successfully", "success");
      setDeleteId(null);
    } catch {
      showToast("Failed to delete expense", "error");
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gk-primary px-5 pt-12 pb-5">
        <h1 className="text-white font-bold text-xl mb-4">Calendar</h1>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-white font-bold text-base">{monthLabel}</h2>
          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden mt-4">
          {/* Week headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
            {weekDays.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-bold text-gk-text-secondary"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => i).map((pos) => (
              <div
                key={`empty-col-${pos}`}
                className="h-14 border-b border-r border-gray-50 dark:border-gray-700/50"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const total = dailyTotals[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday =
                dateStr ===
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-14 flex flex-col items-center justify-center border-b border-r border-gray-50 dark:border-gray-700/50 transition-colors ${
                    isSelected
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-gk-accent text-white"
                        : isSelected
                          ? "text-gk-accent"
                          : "text-gk-text dark:text-white"
                    }`}
                  >
                    {day}
                  </span>
                  {total ? (
                    <span className="text-[9px] font-bold text-gk-accent leading-none mt-0.5">
                      {formatIndianRupee(total).replace("₹", "₹")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail */}
        {selectedDate && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-gk-text dark:text-white font-bold text-sm">
                  {formatDate(selectedDate)}
                </h3>
                <p className="text-gk-text-secondary text-xs">
                  {selectedExpenses.length} expense
                  {selectedExpenses.length !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-gk-accent font-bold text-base">
                {formatIndianRupee(selectedTotal)}
              </p>
            </div>

            {selectedExpenses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gk-text-secondary text-sm">
                  No expenses on this day
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {selectedExpenses.map((expense) => {
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
                          {expense.paymentMode}
                          {expense.notes ? ` · ${expense.notes}` : ""}
                        </p>
                      </div>
                      <p className="text-gk-text dark:text-white font-bold text-sm shrink-0">
                        {formatIndianRupee(expense.amount)}
                      </p>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditExpense(expense)}
                          className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                        >
                          <Edit2 size={14} className="text-blue-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(expense.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"
                        >
                          <Trash2 size={14} className="text-gk-danger" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
