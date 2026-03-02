import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2, Moon, Sun, Lock, Unlock, Info } from 'lucide-react';
import { Settings } from '../backend';
import { formatIndianRupee } from '../utils/formatters';
import { useUpdateSettings, useDeleteExpense, useExpenses } from '../hooks/useQueries';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';

interface SettingsViewProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function SettingsView({ settings, onSettingsChange }: SettingsViewProps) {
  const { showToast } = useToast();
  const updateSettings = useUpdateSettings();
  const deleteExpense = useDeleteExpense();
  const { data: expenses = [] } = useExpenses();

  const [budget, setBudget] = useState(String(Math.round(settings.monthlyBudget)));
  const [income, setIncome] = useState(String(Math.round(settings.annualIncome)));
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');

  useEffect(() => {
    setBudget(String(Math.round(settings.monthlyBudget)));
    setIncome(String(Math.round(settings.annualIncome)));
  }, [settings]);

  const handleSaveBudget = async () => {
    const val = parseFloat(budget);
    if (isNaN(val) || val < 0) { showToast('Invalid budget amount', 'error'); return; }
    const updated = { ...settings, monthlyBudget: val };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
    showToast('Monthly budget saved!', 'success');
  };

  const handleSaveIncome = async () => {
    const val = parseFloat(income);
    if (isNaN(val) || val < 0) { showToast('Invalid income amount', 'error'); return; }
    const updated = { ...settings, annualIncome: val };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
    showToast('Annual income saved!', 'success');
  };

  const handleDarkMode = async (enabled: boolean) => {
    const updated = { ...settings, darkMode: enabled };
    await updateSettings.mutateAsync(updated);
    onSettingsChange(updated);
  };

  const handlePinToggle = async () => {
    if (settings.pinEnabled) {
      const updated = { ...settings, pinEnabled: false, pin: '' };
      await updateSettings.mutateAsync(updated);
      onSettingsChange(updated);
      showToast('PIN lock disabled', 'info');
    } else {
      setShowPinSetup(true);
      setPinInput('');
      setPinConfirm('');
      setPinStep('enter');
    }
  };

  const handlePinSetup = async () => {
    if (pinStep === 'enter') {
      if (pinInput.length !== 4) { showToast('PIN must be 4 digits', 'error'); return; }
      setPinStep('confirm');
    } else {
      if (pinInput !== pinConfirm) { showToast('PINs do not match', 'error'); setPinStep('enter'); setPinInput(''); setPinConfirm(''); return; }
      const updated = { ...settings, pinEnabled: true, pin: pinInput };
      await updateSettings.mutateAsync(updated);
      onSettingsChange(updated);
      setShowPinSetup(false);
      showToast('PIN lock enabled!', 'success');
    }
  };

  const handleClearAll = async () => {
    for (const expense of expenses) {
      await deleteExpense.mutateAsync(expense.id);
    }
    showToast('All data cleared!', 'success');
    setShowClearConfirm(false);
  };

  return (
    <div className="pb-24">
      <div className="bg-gk-primary px-5 pt-12 pb-5">
        <h1 className="text-white font-bold text-xl">Settings</h1>
        <p className="text-green-300 text-xs mt-1">Customize your GharKharcha experience</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">💰 Monthly Budget</h3>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-gk-accent">
              <span className="text-gk-accent font-bold">₹</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gk-text dark:text-white text-sm font-semibold"
                placeholder="20000"
              />
            </div>
            <button
              onClick={handleSaveBudget}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-gk-accent text-white rounded-xl text-sm font-bold flex items-center gap-1 disabled:opacity-70"
            >
              {updateSettings.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
          <p className="text-gk-text-secondary text-xs mt-2">Current: {formatIndianRupee(settings.monthlyBudget)}</p>
        </div>

        {/* Income */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-3">💼 Annual Income</h3>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-gk-accent">
              <span className="text-gk-accent font-bold">₹</span>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gk-text dark:text-white text-sm font-semibold"
                placeholder="300000"
              />
            </div>
            <button
              onClick={handleSaveIncome}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-gk-accent text-white rounded-xl text-sm font-bold flex items-center gap-1 disabled:opacity-70"
            >
              {updateSettings.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
          <p className="text-gk-text-secondary text-xs mt-2">Used for savings estimation in Yearly Analysis</p>
        </div>

        {/* Currency */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <h3 className="text-gk-text dark:text-white font-bold text-sm">💱 Currency</h3>
            <p className="text-gk-text-secondary text-xs mt-0.5">Indian Rupee (fixed)</p>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <span className="text-gk-text dark:text-white font-bold text-sm">₹ INR</span>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? <Moon size={20} className="text-gk-accent" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <h3 className="text-gk-text dark:text-white font-bold text-sm">Dark Mode</h3>
              <p className="text-gk-text-secondary text-xs">{settings.darkMode ? 'Dark theme active' : 'Light theme active'}</p>
            </div>
          </div>
          <button
            onClick={() => handleDarkMode(!settings.darkMode)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.darkMode ? 'bg-gk-accent' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings.darkMode ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* PIN Lock */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.pinEnabled ? <Lock size={20} className="text-gk-accent" /> : <Unlock size={20} className="text-gk-text-secondary" />}
              <div>
                <h3 className="text-gk-text dark:text-white font-bold text-sm">PIN Lock</h3>
                <p className="text-gk-text-secondary text-xs">{settings.pinEnabled ? 'App is locked with PIN' : 'No PIN set'}</p>
              </div>
            </div>
            <button
              onClick={handlePinToggle}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.pinEnabled ? 'bg-gk-accent' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings.pinEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {showPinSetup && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
              <p className="text-gk-text dark:text-white text-sm font-semibold">
                {pinStep === 'enter' ? 'Enter 4-digit PIN' : 'Confirm PIN'}
              </p>
              <input
                type="password"
                maxLength={4}
                value={pinStep === 'enter' ? pinInput : pinConfirm}
                onChange={e => pinStep === 'enter' ? setPinInput(e.target.value) : setPinConfirm(e.target.value)}
                className="w-full bg-white dark:bg-gray-600 rounded-xl px-4 py-2 text-center text-2xl font-bold tracking-widest border border-gray-200 dark:border-gray-500 outline-none focus:border-gk-accent text-gk-text dark:text-white"
                placeholder="••••"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowPinSetup(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gk-text-secondary text-sm font-semibold">Cancel</button>
                <button onClick={handlePinSetup} className="flex-1 py-2 rounded-xl bg-gk-accent text-white text-sm font-bold">
                  {pinStep === 'enter' ? 'Next' : 'Set PIN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Data */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <h3 className="text-gk-text dark:text-white font-bold text-sm mb-1">🗑️ Data Management</h3>
          <p className="text-gk-text-secondary text-xs mb-3">This will permanently delete all your expense data</p>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-gk-danger font-bold text-sm flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <img src="/assets/generated/gharkharcha-logo.dim_128x128.png" alt="GharKharcha" className="w-12 h-12 rounded-xl" />
            <div>
              <h3 className="text-gk-text dark:text-white font-bold">GharKharcha</h3>
              <p className="text-gk-text-secondary text-xs">Smart Home Expense Tracker</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Version</span>
              <span className="text-gk-text dark:text-white text-xs font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Currency</span>
              <span className="text-gk-text dark:text-white text-xs font-semibold">₹ INR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gk-text-secondary text-xs">Built with</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'gharkharcha')}`}
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

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear All Data"
        description="Are you sure you want to delete ALL expenses? This action cannot be undone and all your data will be permanently lost."
        confirmLabel="Clear All"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
