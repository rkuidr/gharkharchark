import { Expense, Settings } from '../backend';
import { filterByMonth, groupByCategory, sumExpenses, getTopCategory } from './analytics';
import { formatIndianRupee } from './formatters';
import { getCategoryConfig } from './categoryConfig';

export interface Insight {
  id: string;
  text: string;
  emoji: string;
  color: string;
  bgColor: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export function generateInsights(expenses: Expense[], settings: Settings): Insight[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const thisMonth = filterByMonth(expenses, year, month);
  const prevMonth = filterByMonth(expenses, month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);

  const thisTotal = sumExpenses(thisMonth);
  const prevTotal = sumExpenses(prevMonth);
  const budget = settings.monthlyBudget;

  const insights: Insight[] = [];

  // Budget alert
  if (budget > 0 && thisTotal >= budget * 0.8) {
    const pct = Math.round((thisTotal / budget) * 100);
    insights.push({
      id: 'budget-alert',
      text: pct >= 100
        ? `⚠️ Budget exceed ho gaya! Aapne ${formatIndianRupee(thisTotal)} kharch kiya, budget tha ${formatIndianRupee(budget)}`
        : `Budget ka ${pct}% use ho gaya! Sirf ${formatIndianRupee(budget - thisTotal)} bacha hai`,
      emoji: pct >= 100 ? '🚨' : '⚠️',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      type: 'alert',
    });
  }

  // Top category
  const top = getTopCategory(thisMonth);
  if (top) {
    const cfg = getCategoryConfig(top.name);
    insights.push({
      id: 'top-category',
      text: `Sabse zyada kharch: ${cfg.emoji} ${top.name} par ${formatIndianRupee(top.amount)} is mahine`,
      emoji: cfg.emoji,
      color: cfg.color,
      bgColor: cfg.bgColor,
      type: 'info',
    });
  }

  // Month comparison
  if (prevTotal > 0 && thisTotal > 0) {
    const diff = ((thisTotal - prevTotal) / prevTotal) * 100;
    const absDiff = Math.abs(Math.round(diff));
    if (diff > 0) {
      insights.push({
        id: 'month-compare',
        text: `Pichle mahine se ${absDiff}% zyada kharch hua. Pichle mahine: ${formatIndianRupee(prevTotal)}`,
        emoji: '📈',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        type: 'warning',
      });
    } else if (diff < 0) {
      insights.push({
        id: 'month-compare',
        text: `Pichle mahine se ${absDiff}% kam kharch hua! Bahut achha! Pichle mahine: ${formatIndianRupee(prevTotal)}`,
        emoji: '📉',
        color: '#22C55E',
        bgColor: '#DCFCE7',
        type: 'success',
      });
    }
  }

  // Category-wise insights
  const thisGrouped = groupByCategory(thisMonth);
  const prevGrouped = groupByCategory(prevMonth);

  const topCategories = Object.entries(thisGrouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  for (const [cat, amount] of topCategories) {
    const cfg = getCategoryConfig(cat);
    const prevAmt = prevGrouped[cat] || 0;

    if (prevAmt > 0) {
      const diff = ((amount - prevAmt) / prevAmt) * 100;
      const absDiff = Math.abs(Math.round(diff));
      if (Math.abs(diff) >= 10) {
        insights.push({
          id: `cat-${cat}`,
          text: diff > 0
            ? `${cfg.emoji} ${cat} par pichle mahine se ${absDiff}% zyada kharch: ${formatIndianRupee(amount)}`
            : `${cfg.emoji} ${cat} par pichle mahine se ${absDiff}% kam kharch: ${formatIndianRupee(amount)}`,
          emoji: cfg.emoji,
          color: diff > 0 ? '#EF4444' : '#22C55E',
          bgColor: diff > 0 ? '#FEE2E2' : '#DCFCE7',
          type: diff > 0 ? 'warning' : 'success',
        });
      }
    } else {
      insights.push({
        id: `cat-${cat}`,
        text: `Aapne is mahine ${cfg.emoji} ${cat} par ${formatIndianRupee(amount)} kharch kiya`,
        emoji: cfg.emoji,
        color: cfg.color,
        bgColor: cfg.bgColor,
        type: 'info',
      });
    }
  }

  // Saving tip
  if (budget > 0 && thisTotal < budget * 0.7) {
    insights.push({
      id: 'saving-tip',
      text: `💡 Tip: Aap budget ke andar hain! ${formatIndianRupee(budget - thisTotal)} bachane ka mauka hai`,
      emoji: '💡',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      type: 'info',
    });
  }

  return insights.slice(0, 6);
}
