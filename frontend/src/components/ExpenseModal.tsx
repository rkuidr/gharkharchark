import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Expense } from '../backend';
import { CATEGORIES, PAYMENT_MODES } from '../utils/categoryConfig';
import { getTodayString, generateUUID } from '../utils/formatters';
import { useAddExpense, useUpdateExpense } from '../hooks/useQueries';
import { useToast } from './Toast';

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  editExpense?: Expense | null;
}

export function ExpenseModal({ open, onClose, editExpense }: ExpenseModalProps) {
  const { showToast } = useToast();
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [date, setDate] = useState(getTodayString());
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (editExpense) {
        setAmount(String(Math.round(editExpense.amount)));
        setCategory(editExpense.category);
        setDate(editExpense.date);
        setPaymentMode(editExpense.paymentMode);
        setNotes(editExpense.notes);
      } else {
        setAmount('');
        setCategory('Grocery');
        setDate(getTodayString());
        setPaymentMode('UPI');
        setNotes('');
      }
    }
  }, [open, editExpense]);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const expense: Expense = {
      id: editExpense?.id || generateUUID(),
      amount: numAmount,
      category,
      date,
      paymentMode,
      notes,
      createdAt: editExpense?.createdAt || BigInt(Date.now()),
    };

    try {
      if (editExpense) {
        await updateExpense.mutateAsync(expense);
        showToast('Expense updated successfully! ✅', 'success');
      } else {
        await addExpense.mutateAsync(expense);
        showToast('Expense saved successfully! ✅', 'success');
      }
      onClose();
    } catch (err) {
      showToast('Failed to save expense. Please try again.', 'error');
    }
  };

  const isLoading = addExpense.isPending || updateExpense.isPending;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="bottom-sheet-overlay absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="bottom-sheet-content relative w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-hide">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gk-text dark:text-white">
            {editExpense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gk-text-secondary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gk-text-secondary uppercase tracking-wide mb-2">Amount</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border-2 border-transparent focus-within:border-gk-accent transition-colors">
              <span className="text-2xl font-bold text-gk-accent">₹</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 text-2xl font-bold bg-transparent outline-none text-gk-text dark:text-white placeholder-gray-300"
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gk-text-secondary uppercase tracking-wide mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    category === cat.name
                      ? 'border-gk-accent bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className={`text-[10px] font-medium leading-tight text-center ${
                    category === cat.name ? 'text-gk-accent' : 'text-gk-text-secondary'
                  }`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gk-text-secondary uppercase tracking-wide mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-gk-text dark:text-white border-2 border-transparent focus:border-gk-accent outline-none transition-colors"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-gk-text-secondary uppercase tracking-wide mb-2">Payment Mode</label>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_MODES.map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                    paymentMode === mode
                      ? 'bg-gk-accent border-gk-accent text-white'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gk-text-secondary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gk-text-secondary uppercase tracking-wide mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-gk-text dark:text-white border-2 border-transparent focus:border-gk-accent outline-none transition-colors resize-none text-sm"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gk-accent text-white font-bold text-base flex items-center justify-center gap-2 shadow-fab active:scale-95 transition-transform disabled:opacity-70"
          >
            {isLoading ? (
              <><Loader2 size={20} className="animate-spin" /> Saving...</>
            ) : (
              editExpense ? '✏️ Update Expense' : '💾 Save Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
