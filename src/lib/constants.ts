// Person avatar colors (distinct, sophisticated)
export const PERSON_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // USD

// Expense categories with icons and colors
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍽️', color: '#10b981' },
  { id: 'accommodation', name: 'Accommodation', icon: '🏠', color: '#6366f1' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#06b6d4' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: '📦', color: '#64748b' },
] as const;

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]['id'];

// Group categories with icons and colors
export const GROUP_CATEGORIES = [
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { id: 'dinner', name: 'Dinner', icon: '🍽️', color: '#10b981' },
  { id: 'colleagues', name: 'Colleagues', icon: '💼', color: '#6366f1' },
  { id: 'roommates', name: 'Roommates', icon: '🏠', color: '#8b5cf6' },
  { id: 'wedding', name: 'Wedding/Event', icon: '💒', color: '#ec4899' },
  { id: 'other', name: 'Other', icon: '👥', color: '#64748b' },
] as const;

export type GroupCategoryId = typeof GROUP_CATEGORIES[number]['id'];
