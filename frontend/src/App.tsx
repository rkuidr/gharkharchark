import React, { useState, useEffect } from 'react';
import { Settings } from './backend';
import { useExpenses, useSettings } from './hooks/useQueries';
import { BottomNav, TabName } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { Analysis } from './components/Analysis';
import { Reports } from './components/Reports';
import { SettingsView } from './components/SettingsView';
import { ExpenseModal } from './components/ExpenseModal';
import { PINLock } from './components/PINLock';
import { ToastProvider } from './components/Toast';
import { Expense } from './backend';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: 20000,
  annualIncome: 300000,
  darkMode: false,
  pinEnabled: false,
  pin: '',
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: fetchedSettings, isLoading: settingsLoading } = useSettings();

  // Sync fetched settings into local state
  useEffect(() => {
    if (fetchedSettings) {
      setLocalSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  // Apply dark mode to document
  useEffect(() => {
    if (localSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [localSettings.darkMode]);

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleCloseModal = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleSettingsChange = (updated: Settings) => {
    setLocalSettings(updated);
  };

  const isLoading = expensesLoading || settingsLoading;

  // PIN lock screen
  if (localSettings.pinEnabled && !isUnlocked && !isLoading) {
    return (
      <PINLock
        correctPin={localSettings.pin}
        onUnlock={() => setIsUnlocked(true)}
      />
    );
  }

  const renderTab = () => {
    if (isLoading) {
      return (
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            expenses={expenses}
            settings={localSettings}
            isLoading={false}
            onAddExpense={handleOpenAddExpense}
            onEditExpense={handleEditExpense}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            expenses={expenses}
            onEditExpense={handleEditExpense}
          />
        );
      case 'analysis':
        return (
          <Analysis
            expenses={expenses}
            settings={localSettings}
          />
        );
      case 'reports':
        return (
          <Reports
            expenses={expenses}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={localSettings}
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <main className="min-h-dvh overflow-y-auto scrollbar-hide">
        <div className="tab-content" key={activeTab}>
          {renderTab()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ExpenseModal
        open={expenseModalOpen}
        onClose={handleCloseModal}
        editExpense={editingExpense}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
