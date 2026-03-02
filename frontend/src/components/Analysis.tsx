import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Expense, Settings } from '../backend';
import { formatIndianRupee, getMonthLabel } from '../utils/formatters';
import {
  filterByMonth, filterByYear, sumExpenses,
  getPieChartData, getDailyBarData, getMonthlyBarData, getTopCategory
} from '../utils/analytics';
import { CHART_COLORS } from '../utils/categoryConfig';

interface AnalysisProps {
  expenses: Expense[];
  settings: Settings;
}

export function Analysis({ expenses, settings }: AnalysisProps) {
  const [subTab, setSubTab] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="pb-24">
      <div className="bg-gk-primary px-5 pt-12 pb-5">
        <h1 className="text-white font-bold text-xl mb-4">Analysis</h1>
        <div className="flex gap-2">
          {(['monthly', 'yearly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                subTab === tab
                  ? 'bg-gk-accent text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {tab === 'monthly' ? '📅 Monthly' : '📆 Yearly'}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {subTab === 'monthly' ? (
          <MonthlyAnalysis expenses={expenses} settings={settings} />
        ) : (
          <YearlyAnalysis expenses={expenses} settings={settings} />
        )}
      </div>
    </div>
  );
}

function MonthlyAnalysis({ expenses, settings }: { expenses: Expense[]; settings: Settings }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonthDate = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

  const monthExpenses = useMemo(() => filterByMonth(expenses, year, month), [expenses, year, month]);
  const prevMonthExpenses = useMemo(() => filterByMonth(expenses, prevMonthDate.year, prevMonthDate.month), [expenses, prevMonthDate.year, prevMonthDate.month]);

  const total = useMemo(() => sumExpenses(monthExpenses), [monthExpenses]);
  const prevTotal = useMemo(() => sumExpenses(prevMonthExpenses), [prevMonthExpenses]);

  const pctChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
  const budgetPct = settings.monthlyBudget > 0 ? Math.min((total / settings.monthlyBudget) * 100, 100) : 0;

  const pieData = useMemo(() => getPieChartData(monthExpenses), [monthExpenses]);
  const dailyData = useMemo(() => getDailyBarData(monthExpenses, year, month), [monthExpenses, year, month]);
  const topCat = useMemo(() => getTopCategory(monthExpenses), [monthExpenses]);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const goToPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goToNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-card">
        <button onClick={goToPrev} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ChevronLeft size={18} className="text-gk-text dark:text-white" />
        </button>
        <h2 className="text-gk-text dark:text-white font-bold text-base">{getMonthLabel(monthStr)}</h2>
        <button onClick={goToNext} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ChevronRight size={18} className="text-gk-text dark:text-white" />
        </button>
      </div>

      {/* Total + Budget */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-gk-text-secondary text-xs font-semibold">Total Spent</p>
            <p className="text-gk-text dark:text-white text-3xl font-bold">{formatIndianRupee(total)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            total <= settings.monthlyBudget ? 'bg-green-100 text-gk-accent' : 'bg-red-100 text-gk-danger'
          }`}>
            {total <= settings.monthlyBudget ? '✅ Under Budget' : '🚨 Over Budget'}
          </div>
        </div>

        {settings.monthlyBudget > 0 && (
          <>
            <div className="flex justify-between text-xs text-gk-text-secondary mb-1">
              <span>Budget: {formatIndianRupee(settings.monthlyBudget)}</span>
              <span>{Math.round(budgetPct)}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${budgetPct}%`,
                  backgroundColor: budgetPct >= 100 ? '#EF4444' : budgetPct >= 80 ? '#F59E0B' : '#22C55E',
                }}
              />
            </div>
          </>
        )}

        {prevTotal > 0 && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${pctChange > 0 ? 'text-gk-danger' : 'text-gk-accent'}`}>
            <span>{pctChange > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(Math.round(pctChange))}% vs last month ({formatIndianRupee(prevTotal)})</span>
          </div>
        )}
      </div>

      {/* Top Category */}
      {topCat && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🏆</div>
          <div>
            <p className="text-gk-text-secondary text-xs">Top Spending Category</p>
            <p className="text-gk-text dark:text-white font-bold">{topCat.name}</p>
            <p className="text-gk-accent text-sm font-bold">{formatIndianRupee(topCat.amount)}</p>
          </div>
        </div>
      )}

      {/* Pie Chart */}
      {pieData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatIndianRupee(v)} />
              <Legend formatter={(v) => <span className="text-xs text-gk-text-secondary">{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card text-center">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-gk-text-secondary text-sm">No data for this month</p>
        </div>
      )}

      {/* Daily Bar Chart */}
      {dailyData.some(d => d.amount > 0) ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatIndianRupee(v)} labelFormatter={(l) => `Day ${l}`} />
              <Bar dataKey="amount" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}

function YearlyAnalysis({ expenses, settings }: { expenses: Expense[]; settings: Settings }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const yearExpenses = useMemo(() => filterByYear(expenses, year), [expenses, year]);
  const monthlyData = useMemo(() => getMonthlyBarData(yearExpenses, year), [yearExpenses, year]);

  const total = useMemo(() => sumExpenses(yearExpenses), [yearExpenses]);
  const avgMonthly = total / 12;
  const savings = settings.annualIncome - total;

  const highestMonth = useMemo(() => {
    return monthlyData.reduce((max, m) => m.amount > max.amount ? m : max, monthlyData[0]);
  }, [monthlyData]);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Year Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-card">
        <button onClick={() => setYear(y => y - 1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ChevronLeft size={18} className="text-gk-text dark:text-white" />
        </button>
        <h2 className="text-gk-text dark:text-white font-bold text-base">{year}</h2>
        <button onClick={() => setYear(y => y + 1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ChevronRight size={18} className="text-gk-text dark:text-white" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <p className="text-gk-text-secondary text-xs">Total Yearly</p>
          <p className="text-gk-text dark:text-white text-lg font-bold mt-1">{formatIndianRupee(total)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <p className="text-gk-text-secondary text-xs">Avg Monthly</p>
          <p className="text-gk-text dark:text-white text-lg font-bold mt-1">{formatIndianRupee(avgMonthly)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <p className="text-gk-text-secondary text-xs">Highest Month</p>
          <p className="text-gk-accent text-lg font-bold mt-1">{highestMonth?.month || '-'}</p>
          <p className="text-gk-text-secondary text-xs">{highestMonth ? formatIndianRupee(highestMonth.amount) : ''}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <p className="text-gk-text-secondary text-xs">Est. Savings</p>
          <p className={`text-lg font-bold mt-1 ${savings >= 0 ? 'text-gk-accent' : 'text-gk-danger'}`}>
            {formatIndianRupee(Math.abs(savings))}
          </p>
          <p className="text-gk-text-secondary text-xs">{savings >= 0 ? 'saved' : 'deficit'}</p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">Monthly Breakdown</h3>
        {monthlyData.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatIndianRupee(v)} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.month === highestMonth?.month ? '#EF4444' : '#22C55E'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-gk-text-secondary text-sm">No data for {year}</p>
          </div>
        )}
      </div>
    </div>
  );
}
