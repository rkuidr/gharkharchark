import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useCallback } from "react";
import type { Settings } from "./backend";
import type { Expense } from "./backend";
import { Analysis } from "./components/Analysis";
import { BottomNav, type TabName } from "./components/BottomNav";
import { CalendarView } from "./components/CalendarView";
import { Dashboard } from "./components/Dashboard";
import { ExpenseModal } from "./components/ExpenseModal";
import { LoginScreen } from "./components/LoginScreen";
import { PINLock } from "./components/PINLock";
import { PhoneAuthScreen } from "./components/PhoneAuthScreen";
import { Reports } from "./components/Reports";
import { SettingsView } from "./components/SettingsView";
import { SignupScreen } from "./components/SignupScreen";
import { SplashScreen } from "./components/SplashScreen";
import { ToastProvider } from "./components/Toast";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  useLocalExpenses,
  useLocalSettings,
  useLocalUpdateSettings,
} from "./hooks/useLocalQueries";

type AppScreen = "splash" | "welcome" | "login" | "signup" | "phone" | "app";

const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: 20000,
  annualIncome: 300000,
  darkMode: false,
  pinEnabled: false,
  pin: "",
};

function MainApp({ userId }: { userId: string }) {
  const { currentUser, logout, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [localSettings, setLocalSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const { data: expenses = [], isLoading: expensesLoading } =
    useLocalExpenses(userId);
  const { data: fetchedSettings, isLoading: settingsLoading } =
    useLocalSettings(userId);
  const updateSettings = useLocalUpdateSettings(userId);

  // Sync fetched settings into local state
  useEffect(() => {
    if (fetchedSettings) {
      // Merge currentUser.monthlyBudget as fallback
      setLocalSettings({
        ...fetchedSettings,
        monthlyBudget:
          fetchedSettings.monthlyBudget || currentUser?.monthlyBudget || 20000,
      });
    }
  }, [fetchedSettings, currentUser?.monthlyBudget]);

  // Apply dark mode to document
  useEffect(() => {
    if (localSettings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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

  const handleSettingsChange = useCallback(
    async (updated: Settings) => {
      setLocalSettings(updated);
      await updateSettings.mutateAsync(updated);
    },
    [updateSettings],
  );

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    deleteAccount();
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
      case "home":
        return (
          <Dashboard
            expenses={expenses}
            settings={localSettings}
            isLoading={false}
            onAddExpense={handleOpenAddExpense}
            onEditExpense={handleEditExpense}
          />
        );
      case "calendar":
        return (
          <CalendarView expenses={expenses} onEditExpense={handleEditExpense} />
        );
      case "analysis":
        return <Analysis expenses={expenses} settings={localSettings} />;
      case "reports":
        return <Reports expenses={expenses} />;
      case "settings":
        return (
          <SettingsView
            settings={localSettings}
            onSettingsChange={handleSettingsChange}
            currentUser={currentUser}
            userId={userId}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
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
        userId={userId}
      />
    </div>
  );
}

function AppContent() {
  const { currentUser, isLoading: authLoading, loginWithGoogle } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("splash");

  // After splash, decide next screen
  const handleSplashDone = useCallback(() => {
    if (currentUser) {
      setScreen("app");
    } else {
      setScreen("welcome");
    }
  }, [currentUser]);

  // If auth loads and user is already logged in, skip to app after splash
  useEffect(() => {
    if (!authLoading && currentUser && screen === "welcome") {
      setScreen("app");
    }
    if (!authLoading && !currentUser && screen === "app") {
      setScreen("welcome");
    }
  }, [authLoading, currentUser, screen]);

  const handleAuthSuccess = useCallback(() => {
    setScreen("app");
  }, []);

  const handleGuestLogin = useCallback(() => {
    loginWithGoogle();
    setScreen("app");
  }, [loginWithGoogle]);

  if (screen === "splash") {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onLogin={() => setScreen("login")}
        onSignup={() => setScreen("signup")}
        onGuest={handleGuestLogin}
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onBack={() => setScreen("welcome")}
        onSignup={() => setScreen("signup")}
        onPhone={() => setScreen("phone")}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignupScreen
        onBack={() => setScreen("welcome")}
        onLogin={() => setScreen("login")}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (screen === "phone") {
    return (
      <PhoneAuthScreen
        onBack={() => setScreen("login")}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // screen === 'app'
  if (!currentUser) {
    return (
      <WelcomeScreen
        onLogin={() => setScreen("login")}
        onSignup={() => setScreen("signup")}
        onGuest={handleGuestLogin}
      />
    );
  }

  return (
    <ToastProvider>
      <MainApp userId={currentUser.id} />
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
