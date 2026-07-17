/**
 * Core domain models for the bill-splitting application
 */

import type { ExpenseCategoryId, GroupCategoryId } from '@/lib/constants';

// Person within a group
export interface Person {
  id: string;
  name: string;
  color: string; // For visual identification
  createdAt: Date;
}

// Split configuration for an expense
export type SplitType = 'equal' | 'custom';

export interface Split {
  personId: string;
  amount: number; // For custom splits, this is the exact amount
}

// Expense entry
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category?: ExpenseCategoryId; // Optional category for filtering
  paidBy: string; // Person ID who paid
  splitType: SplitType;
  splits: Split[]; // How the expense is divided
  note?: string; // Optional free-text note / details
  date: Date;
  createdAt: Date;
}

// Settlement of a debt
export interface Settlement {
  id: string;
  groupId: string;
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  note?: string;
  settledAt: Date;
}

// Group container
export interface Group {
  id: string;
  name: string;
  description?: string;
  category?: GroupCategoryId; // Optional category for organization
  startDate?: Date; // Optional start date for the group activity
  endDate?: Date; // Optional end date for the group activity
  currency: string; // Default: 'USD'
  currencySymbol: string; // Default: '$'
  members: Person[];
  expenses: Expense[];
  settlements: Settlement[];
  createdAt: Date;
  updatedAt: Date;
}

// Calculated balance for debt simplification
export interface Balance {
  personId: string;
  netBalance: number; // Positive = owed to them, Negative = they owe
}

// Simplified debt after calculation
export interface Debt {
  from: string; // Person ID
  to: string; // Person ID
  amount: number;
}

// UI State types
export interface GroupSummary {
  group: Group;
  balances: Balance[];
  simplifiedDebts: Debt[];
  totalExpenses: number;
  expenseCount: number;
}
