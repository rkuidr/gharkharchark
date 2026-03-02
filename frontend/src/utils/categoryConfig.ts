export interface CategoryConfig {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { name: 'Grocery', emoji: '🛒', color: '#22C55E', bgColor: '#DCFCE7' },
  { name: 'Rent', emoji: '🏠', color: '#3B82F6', bgColor: '#DBEAFE' },
  { name: 'Electricity', emoji: '⚡', color: '#F59E0B', bgColor: '#FEF3C7' },
  { name: 'Water', emoji: '💧', color: '#06B6D4', bgColor: '#CFFAFE' },
  { name: 'Gas', emoji: '🔥', color: '#EF4444', bgColor: '#FEE2E2' },
  { name: 'EMI', emoji: '💳', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { name: 'School Fees', emoji: '🏫', color: '#EC4899', bgColor: '#FCE7F3' },
  { name: 'Medical', emoji: '🏥', color: '#14B8A6', bgColor: '#CCFBF1' },
  { name: 'Travel', emoji: '🚗', color: '#F97316', bgColor: '#FFEDD5' },
  { name: 'Shopping', emoji: '🛍️', color: '#A855F7', bgColor: '#F3E8FF' },
  { name: 'Other', emoji: '📦', color: '#64748B', bgColor: '#F1F5F9' },
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export function getCategoryConfig(name: string): CategoryConfig {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
}

export const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

export const CHART_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#06B6D4', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#A855F7', '#64748B'
];
