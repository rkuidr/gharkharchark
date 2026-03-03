import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Expense, Settings } from "../backend";
import {
  filterByMonth,
  getPieChartData,
  sumExpenses,
} from "../utils/analytics";
import { CHART_COLORS, getCategoryConfig } from "../utils/categoryConfig";
import {
  formatDate,
  formatIndianRupee,
  getTodayString,
} from "../utils/formatters";
import { generateInsights } from "../utils/insightGenerator";

interface DashboardProps {
  expenses: Expense[];
  settings: Settings;
  isLoading: boolean;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

export function Dashboard({
  expenses,
  settings,
  isLoading,
  onAddExpense,
  onEditExpense,
}: DashboardProps) {
  const today = getTodayString();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today],
  );
  const monthExpenses = useMemo(
    () => filterByMonth(expenses, year, month),
    [expenses, year, month],
  );

  const todayTotal = useMemo(() => sumExpenses(todayExpenses), [todayExpenses]);
  const monthTotal = useMemo(() => sumExpenses(monthExpenses), [monthExpenses]);
  const remaining = settings.monthlyBudget - monthTotal;

  const pieData = useMemo(
    () => getPieChartData(monthExpenses),
    [monthExpenses],
  );
  const recentExpenses = useMemo(
    () => [...expenses].reverse().slice(0, 5),
    [expenses],
  );
  const insights = useMemo(
    () => generateInsights(expenses, settings),
    [expenses, settings],
  );

  const budgetPct =
    settings.monthlyBudget > 0
      ? Math.min((monthTotal / settings.monthlyBudget) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gk-primary px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/gharkharcha-logo.dim_128x128.png"
              alt="FamilyExpense"
              className="w-10 h-10 rounded-xl"
            />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                FamilyExpense
              </h1>
              <p className="text-green-300 text-xs">Smart Home Tracker</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-300 text-xs">Namaste! 🙏</p>
            <p className="text-white text-xs opacity-70">{formatDate(today)}</p>
          </div>
        </div>

        {/* Today's Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-green-300 text-xs font-semibold uppercase tracking-wide">
            Today's Expense
          </p>
          <p className="text-white text-3xl font-bold mt-1">
            {formatIndianRupee(todayTotal)}
          </p>
          <p className="text-white/60 text-xs mt-1">
            {todayExpenses.length} transaction
            {todayExpenses.length !== 1 ? "s" : ""} today
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Month + Budget Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <p className="text-gk-text-secondary text-xs font-semibold">
              This Month
            </p>
            <p className="text-gk-text dark:text-white text-xl font-bold mt-1">
              {formatIndianRupee(monthTotal)}
            </p>
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${budgetPct}%`,
                  backgroundColor: budgetPct >= 100 ? "#EF4444" : "#22C55E",
                }}
              />
            </div>
            <p className="text-gk-text-secondary text-[10px] mt-1">
              {Math.round(budgetPct)}% of budget
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <p className="text-gk-text-secondary text-xs font-semibold">
              Remaining
            </p>
            <p
              className={`text-xl font-bold mt-1 ${remaining >= 0 ? "text-gk-accent" : "text-gk-danger"}`}
            >
              {formatIndianRupee(Math.abs(remaining))}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {remaining >= 0 ? (
                <>
                  <TrendingDown size={12} className="text-gk-accent" />
                  <span className="text-gk-accent text-[10px] font-semibold">
                    Under budget
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={12} className="text-gk-danger" />
                  <span className="text-gk-danger text-[10px] font-semibold">
                    Over budget
                  </span>
                </>
              )}
            </div>
            <p className="text-gk-text-secondary text-[10px] mt-0.5">
              Budget: {formatIndianRupee(settings.monthlyBudget)}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">
              Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${pieData[index]?.name ?? index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatIndianRupee(value)}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gk-text-secondary">
                      {value}
                    </span>
                  )}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gk-text-secondary text-sm">
              No expenses this month yet
            </p>
            <p className="text-gk-text-secondary text-xs mt-1">
              Add your first expense to see the chart
            </p>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">
            Recent Transactions
          </h3>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🧾</p>
              <p className="text-gk-text-secondary text-sm">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const cfg = getCategoryConfig(expense.category);
                return (
                  <button
                    type="button"
                    key={expense.id}
                    onClick={() => onEditExpense(expense)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: cfg.bgColor }}
                    >
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gk-text dark:text-white text-sm font-semibold truncate">
                        {expense.category}
                      </p>
                      <p className="text-gk-text-secondary text-xs">
                        {formatDate(expense.date)} · {expense.paymentMode}
                      </p>
                    </div>
                    <p className="text-gk-text dark:text-white font-bold text-sm shrink-0">
                      {formatIndianRupee(expense.amount)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div>
            <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3 px-1">
              💡 Smart Insights
            </h3>
            <div className="space-y-2">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ backgroundColor: insight.bgColor }}
                >
                  <span className="text-xl shrink-0">{insight.emoji}</span>
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: insight.color }}
                  >
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gk-text-secondary text-xs">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "familyexpense")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gk-accent font-semibold"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-gk-text-secondary text-xs mt-0.5">
            © {new Date().getFullYear()} FamilyExpense
          </p>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={onAddExpense}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gk-accent shadow-fab flex items-center justify-center z-30 active:scale-90 transition-transform"
        style={{
          maxWidth: "calc(430px - 16px)",
          right: "max(16px, calc(50vw - 215px + 16px))",
        }}
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
