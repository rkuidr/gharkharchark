import {
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Moon,
  Save,
  ShieldAlert,
  Sun,
  Trash2,
  Unlock,
  User,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Settings } from "../backend";
import { type User as AuthUser, useAuth } from "../contexts/AuthContext";
import {
  useLocalDeleteExpense,
  useLocalExpenses,
  useLocalUpdateSettings,
} from "../hooks/useLocalQueries";
import { formatIndianRupee } from "../utils/formatters";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

interface SettingsViewProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  currentUser: AuthUser | null;
  userId: string | null;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function SettingsView({
  settings,
  onSettingsChange,
  currentUser,
  userId,
  onLogout,
  onDeleteAccount,
}: SettingsViewProps) {
  const { showToast } = useToast();
  const { updateProfile, changePassword } = useAuth();
  const updateSettings = useLocalUpdateSettings(userId);
  const deleteExpense = useLocalDeleteExpense(userId);
  const { data: expenses = [] } = useLocalExpenses(userId);

  const [budget, setBudget] = useState(
    String(Math.round(settings.monthlyBudget)),
  );
  const [income, setIncome] = useState(
    String(Math.round(settings.annualIncome)),
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter");

  // Profile edit
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone ?? "");
  const [profileBudget, setProfileBudget] = useState(
    String(currentUser?.monthlyBudget ?? 20000),
  );

  // Change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setBudget(String(Math.round(settings.monthlyBudget)));
    setIncome(String(Math.round(settings.annualIncome)));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone);
      setProfileBudget(String(currentUser.monthlyBudget));
    }
  }, [currentUser]);

  const handleSaveBudget = async () => {
    const val = Number.parseFloat(budget);
    if (Number.isNaN(val) || val < 0) {
      showToast("Invalid budget amount", "error");
      return;
    }
    const updated = { ...settings, monthlyBudget: val };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
    showToast("Monthly budget saved!", "success");
  };

  const handleSaveIncome = async () => {
    const val = Number.parseFloat(income);
    if (Number.isNaN(val) || val < 0) {
      showToast("Invalid income amount", "error");
      return;
    }
    const updated = { ...settings, annualIncome: val };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
    showToast("Annual income saved!", "success");
  };

  const handleDarkMode = async (enabled: boolean) => {
    const updated = { ...settings, darkMode: enabled };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
  };

  const handlePinToggle = async () => {
    if (settings.pinEnabled) {
      const updated = { ...settings, pinEnabled: false, pin: "" };
      await updateSettings.mutateAsync(updated);
      onSettingsChange(updated);
      showToast("PIN lock disabled", "info");
    } else {
      setShowPinSetup(true);
      setPinInput("");
      setPinConfirm("");
      setPinStep("enter");
    }
  };

  const handlePinSetup = async () => {
    if (pinStep === "enter") {
      if (pinInput.length !== 4) {
        showToast("PIN must be 4 digits", "error");
        return;
      }
      setPinStep("confirm");
    } else {
      if (pinInput !== pinConfirm) {
        showToast("PINs do not match", "error");
        setPinStep("enter");
        setPinInput("");
        setPinConfirm("");
        return;
      }
      const updated = { ...settings, pinEnabled: true, pin: pinInput };
      await updateSettings.mutateAsync(updated);
      onSettingsChange(updated);
      setShowPinSetup(false);
      showToast("PIN lock enabled!", "success");
    }
  };

  const handleClearAll = async () => {
    for (const expense of expenses) {
      await deleteExpense.mutateAsync(expense.id);
    }
    showToast("All data cleared!", "success");
    setShowClearConfirm(false);
  };

  const handleSaveProfile = () => {
    try {
      const budgetVal = Number.parseFloat(profileBudget);
      if (Number.isNaN(budgetVal) || budgetVal < 0) {
        showToast("Invalid budget amount", "error");
        return;
      }
      updateProfile(profileName, profilePhone, budgetVal);
      // Also update settings budget
      const updated = { ...settings, monthlyBudget: budgetVal };
      updateSettings.mutateAsync(updated);
      onSettingsChange(updated);
      setShowProfileEdit(false);
      showToast("Profile updated!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleChangePassword = () => {
    setPasswordError("");
    if (!oldPassword) {
      setPasswordError("Purana password daalen");
      return;
    }
    if (!newPassword) {
      setPasswordError("Naya password daalen");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password kam se kam 6 characters ka hona chahiye");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Dono passwords match nahi karte");
      return;
    }
    try {
      changePassword(oldPassword, newPassword);
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      showToast("Password badal diya gaya!", "success");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Password change failed",
      );
    }
  };

  const avatarLetter = currentUser?.name?.charAt(0)?.toUpperCase() ?? "?";
  const avatarColors = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const avatarColor =
    avatarColors[(currentUser?.name?.charCodeAt(0) ?? 0) % avatarColors.length];

  return (
    <div className="pb-24">
      <div className="bg-gk-primary px-5 pt-12 pb-5">
        <h1 className="text-white font-bold text-xl">Settings</h1>
        <p className="text-green-300 text-xs mt-1">
          Customize your FamilyExpense experience
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Profile Card ── */}
        {currentUser && (
          <div
            data-ocid="settings.profile_card"
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ background: avatarColor }}
              >
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gk-text dark:text-white font-bold truncate">
                  {currentUser.name}
                </p>
                <p className="text-gk-text-secondary text-xs truncate">
                  {currentUser.email}
                </p>
                {currentUser.phone && (
                  <p className="text-gk-text-secondary text-xs">
                    +91 {currentUser.phone}
                  </p>
                )}
              </div>
              <button
                type="button"
                data-ocid="settings.edit_profile_button"
                onClick={() => setShowProfileEdit(!showProfileEdit)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gk-accent border border-gk-accent bg-green-50 dark:bg-green-900/20 shrink-0"
              >
                <User size={12} className="inline mr-1" />
                Edit
              </button>
            </div>

            {showProfileEdit && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div>
                  <label
                    htmlFor="settings-profile-name"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Poora Naam
                  </label>
                  <input
                    id="settings-profile-name"
                    data-ocid="settings.profile_name_input"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm text-gk-text dark:text-white border border-gray-200 dark:border-gray-600 outline-none focus:border-gk-accent"
                    placeholder="Apna naam"
                  />
                </div>
                <div>
                  <label
                    htmlFor="settings-profile-phone"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="settings-profile-phone"
                    data-ocid="settings.profile_phone_input"
                    type="tel"
                    value={profilePhone}
                    onChange={(e) =>
                      setProfilePhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm text-gk-text dark:text-white border border-gray-200 dark:border-gray-600 outline-none focus:border-gk-accent"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label
                    htmlFor="settings-profile-budget"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Monthly Budget (₹)
                  </label>
                  <input
                    id="settings-profile-budget"
                    data-ocid="settings.profile_budget_input"
                    type="number"
                    value={profileBudget}
                    onChange={(e) => setProfileBudget(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm text-gk-text dark:text-white border border-gray-200 dark:border-gray-600 outline-none focus:border-gk-accent"
                    placeholder="20000"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gk-text-secondary text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-ocid="settings.profile_save_button"
                    onClick={handleSaveProfile}
                    className="flex-1 py-2 rounded-xl bg-gk-accent text-white text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">
            💰 Monthly Budget
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-gk-accent">
              <span className="text-gk-accent font-bold">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gk-text dark:text-white text-sm font-semibold"
                placeholder="20000"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveBudget}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-gk-accent text-white rounded-xl text-sm font-bold flex items-center gap-1 disabled:opacity-70"
            >
              {updateSettings.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </button>
          </div>
          <p className="text-gk-text-secondary text-xs mt-2">
            Current: {formatIndianRupee(settings.monthlyBudget)}
          </p>
        </div>

        {/* Income */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">
            💼 Annual Income
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-gk-accent">
              <span className="text-gk-accent font-bold">₹</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gk-text dark:text-white text-sm font-semibold"
                placeholder="300000"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveIncome}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-gk-accent text-white rounded-xl text-sm font-bold flex items-center gap-1 disabled:opacity-70"
            >
              {updateSettings.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </button>
          </div>
          <p className="text-gk-text-secondary text-xs mt-2">
            Used for savings estimation in Yearly Analysis
          </p>
        </div>

        {/* Currency */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <h3 className="text-gk-text dark:text-white font-bold text-sm">
              💱 Currency
            </h3>
            <p className="text-gk-text-secondary text-xs mt-0.5">
              Indian Rupee (fixed)
            </p>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <span className="text-gk-text dark:text-white font-bold text-sm">
              ₹ INR
            </span>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? (
              <Moon size={20} className="text-gk-accent" />
            ) : (
              <Sun size={20} className="text-amber-500" />
            )}
            <div>
              <h3 className="text-gk-text dark:text-white font-bold text-sm">
                Dark Mode
              </h3>
              <p className="text-gk-text-secondary text-xs">
                {settings.darkMode ? "Dark theme active" : "Light theme active"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDarkMode(!settings.darkMode)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.darkMode ? "bg-gk-accent" : "bg-gray-200"}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings.darkMode ? "left-6" : "left-0.5"}`}
            />
          </button>
        </div>

        {/* PIN Lock */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.pinEnabled ? (
                <Lock size={20} className="text-gk-accent" />
              ) : (
                <Unlock size={20} className="text-gk-text-secondary" />
              )}
              <div>
                <h3 className="text-gk-text dark:text-white font-bold text-sm">
                  PIN Lock
                </h3>
                <p className="text-gk-text-secondary text-xs">
                  {settings.pinEnabled
                    ? "App is locked with PIN"
                    : "No PIN set"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePinToggle}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.pinEnabled ? "bg-gk-accent" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings.pinEnabled ? "left-6" : "left-0.5"}`}
              />
            </button>
          </div>

          {showPinSetup && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
              <p className="text-gk-text dark:text-white text-sm font-semibold">
                {pinStep === "enter" ? "Enter 4-digit PIN" : "Confirm PIN"}
              </p>
              <input
                type="password"
                maxLength={4}
                value={pinStep === "enter" ? pinInput : pinConfirm}
                onChange={(e) =>
                  pinStep === "enter"
                    ? setPinInput(e.target.value)
                    : setPinConfirm(e.target.value)
                }
                className="w-full bg-white dark:bg-gray-600 rounded-xl px-4 py-2 text-center text-2xl font-bold tracking-widest border border-gray-200 dark:border-gray-500 outline-none focus:border-gk-accent text-gk-text dark:text-white"
                placeholder="••••"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinSetup(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gk-text-secondary text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePinSetup}
                  className="flex-1 py-2 rounded-xl bg-gk-accent text-white text-sm font-bold"
                >
                  {pinStep === "enter" ? "Next" : "Set PIN"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Data */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-1">
            🗑️ Data Management
          </h3>
          <p className="text-gk-text-secondary text-xs mb-3">
            This will permanently delete all your expense data
          </p>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-gk-danger font-bold text-sm flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>

        {/* ── Account Actions ── */}
        {currentUser && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card space-y-3">
            <h3 className="text-gk-text dark:text-white font-bold text-sm">
              🔐 Account
            </h3>

            {/* Change Password */}
            <button
              type="button"
              data-ocid="settings.change_password_button"
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setPasswordError("");
              }}
              className="w-full py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gk-text dark:text-white font-semibold text-sm flex items-center gap-2 px-4 border border-gray-200 dark:border-gray-600"
            >
              <KeyRound size={16} className="text-gk-accent" />
              Password badlo
            </button>

            {showChangePassword && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
                {passwordError && (
                  <p className="text-red-500 text-xs font-medium">
                    {passwordError}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="settings-old-password"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Purana Password
                  </label>
                  <input
                    id="settings-old-password"
                    data-ocid="settings.old_password_input"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-white dark:bg-gray-600 rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-500 outline-none focus:border-gk-accent text-gk-text dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label
                    htmlFor="settings-new-password"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Naya Password
                  </label>
                  <input
                    id="settings-new-password"
                    data-ocid="settings.new_password_input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-gray-600 rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-500 outline-none focus:border-gk-accent text-gk-text dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label
                    htmlFor="settings-confirm-password"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Naya Password Confirm
                  </label>
                  <input
                    id="settings-confirm-password"
                    data-ocid="settings.confirm_password_input"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-gray-600 rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-500 outline-none focus:border-gk-accent text-gk-text dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gk-text-secondary text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-ocid="settings.change_password_save_button"
                    onClick={handleChangePassword}
                    className="flex-1 py-2 rounded-xl bg-gk-accent text-white text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              type="button"
              data-ocid="settings.logout_button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center gap-2 px-4 border-2 border-red-300 text-red-500 bg-red-50 dark:bg-red-900/10"
            >
              <LogOut size={16} />
              Logout
            </button>

            {/* Delete Account */}
            <button
              type="button"
              data-ocid="settings.delete_account_button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center gap-2 px-4 bg-red-500 text-white"
            >
              <ShieldAlert size={16} />
              Account delete karo
            </button>
          </div>
        )}

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/assets/uploads/FamilyExpense-Logo-1.png"
              alt="FamilyExpense"
              className="w-12 h-12 rounded-xl object-contain"
            />
            <div>
              <h3 className="text-gk-text dark:text-white font-bold">
                FamilyExpense
              </h3>
              <p className="text-gk-text-secondary text-xs">
                Smart Home Expense Tracker
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Version</span>
              <span className="text-gk-text dark:text-white text-xs font-semibold">
                2.0.0
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Currency</span>
              <span className="text-gk-text dark:text-white text-xs font-semibold">
                ₹ INR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Built with</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "familyexpense")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gk-accent text-xs font-semibold"
              >
                caffeine.ai ❤️
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear All Data"
        description="Are you sure you want to delete ALL expenses? This action cannot be undone and all your data will be permanently lost."
        confirmLabel="Clear All"
        onConfirm={handleClearAll}
      />

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Logout"
        description="Kya aap sure hain ki aap logout karna chahte hain?"
        confirmLabel="Logout"
        onConfirm={onLogout}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Account Delete Karein"
        description="Aapka saara data permanently delete ho jayega. Kya aap sure hain? Yeh action undo nahi ho sakta."
        confirmLabel="Haan, Delete Karo"
        onConfirm={onDeleteAccount}
      />
    </div>
  );
}
