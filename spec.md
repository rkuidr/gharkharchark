# Specification

## Summary
**Goal:** Build GharKharcha, a mobile-first smart home expense tracker for Indian families with full CRUD expense management, multi-screen analytics, and a polished Android-app aesthetic.

**Planned changes:**

### Backend (Motoko)
- Create `backend/main.mo` with stable storage for `Expense` records (id, amount, category, date, paymentMode, notes, createdAt) and `Settings` record (monthlyBudget, annualIncome, darkMode, pinEnabled, pin)
- Expose CRUD functions: `addExpense`, `updateExpense`, `deleteExpense`, `getExpenses`, `getSettings`, `updateSettings`
- Seed 3 months of realistic sample data (Jan–Mar 2026, all 11 categories, ₹18,000–₹28,000/month) on first deploy if storage is empty

### Frontend (React SPA)
- Mobile-first layout, max-width 430px centered on desktop, using color palette: Primary #0F172A, Accent #22C55E, Background #F1F5F9, Danger #EF4444, Card #FFFFFF, Text #1E293B/#64748B; rounded cards (16px), smooth tab-switch animations
- **Bottom navigation** with 5 tabs: Home, Calendar, Analysis, Reports, Settings; active tab highlighted in #22C55E
- **Dashboard tab:** GharKharcha header with "Namaste! 🙏" greeting; today's expense card; this month's total card; budget remaining card (green/red); Recharts PieChart for category-wise spending; last 5 recent transactions (emoji, name, ₹ Indian format, DD MMM YYYY); Smart Insights section (Hindi-style English cards with per-category spend, month-over-month comparison, 80%+ budget alert, highest-spending category)
- **FAB (floating action button):** Green circular + button on Dashboard opens Add Expense bottom sheet with ₹ amount input, 11-category dropdown with emojis, date picker (default today), payment mode pill buttons (Cash/UPI/Card/Bank), optional notes, Save button; same modal supports Edit mode with pre-filled fields
- **Calendar tab:** Monthly grid calendar showing daily expense totals per cell; clicking a date opens a bottom sheet with that day's expense list (emoji, name, payment mode, amount, edit/delete); prev/next month navigation
- **Analysis tab:** Monthly sub-tab (month selector, budget progress bar, MoM % comparison, PieChart, daily BarChart, top category, budget badge) and Yearly sub-tab (year selector, monthly BarChart Jan–Dec, yearly total, average monthly, highest month highlight, savings estimate)
- **Reports tab:** Filter panel (date range, category multi-select, payment mode); filtered expense list; summary bar (total + count); export buttons: PDF (print), CSV (download), Share (copy to clipboard)
- **Settings tab:** Monthly budget and annual income inputs; currency display (₹ INR, read-only); dark mode toggle (persisted, app-wide); PIN lock toggle (4-digit PIN setup + lock screen on launch); Clear All Data (confirmation dialog); About section (GharKharcha v1.0.0)
- **Global UX:** Toast notifications for save/update/delete; confirmation dialogs for destructive actions; empty states; Indian Rupee formatting (₹1,23,456); DD MMM YYYY dates throughout; loading states during backend calls

**User-visible outcome:** Users can track daily household expenses with full add/edit/delete support, view spending trends through charts and a calendar, generate filtered reports with export options, configure a monthly budget and PIN lock, and receive Hindi-style smart insights — all in a polished mobile-first interface pre-loaded with 3 months of sample data.
