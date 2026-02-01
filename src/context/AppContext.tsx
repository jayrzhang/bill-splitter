import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Group, Person, Expense, Settlement, GroupSummary } from '@/types';
import { StorageService } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { calculateBalances, simplifyDebts } from '@/lib/calculations';
import { PERSON_COLORS, DEFAULT_CURRENCY, CURRENCIES } from '@/lib/constants';

interface AppContextType {
  // State
  groups: Group[];
  currentGroupId: string | null;

  // Group operations
  createGroup: (name: string, description?: string, currencyCode?: string) => Group;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  setCurrentGroup: (id: string | null) => void;
  getCurrentGroup: () => Group | null;
  getGroupSummary: (groupId: string) => GroupSummary | null;

  // Person operations
  addPerson: (groupId: string, name: string) => Person;
  updatePerson: (groupId: string, personId: string, updates: Partial<Person>) => void;
  removePerson: (groupId: string, personId: string) => void;

  // Expense operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settlement operations
  addSettlement: (settlement: Omit<Settlement, 'id' | 'settledAt'>) => Settlement;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    const loadedGroups = StorageService.loadGroups();
    setGroups(loadedGroups);

    const loadedCurrentGroupId = StorageService.loadCurrentGroupId();
    setCurrentGroupIdState(loadedCurrentGroupId);

    setIsInitialized(true);
  }, []);

  // Save groups to storage whenever they change (after initial load)
  useEffect(() => {
    if (isInitialized) {
      StorageService.saveGroups(groups);
    }
  }, [groups, isInitialized]);

  // Save current group ID whenever it changes (after initial load)
  useEffect(() => {
    if (isInitialized) {
      StorageService.saveCurrentGroupId(currentGroupId);
    }
  }, [currentGroupId, isInitialized]);

  // Group operations
  const createGroup = (name: string, description?: string, currencyCode?: string): Group => {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || DEFAULT_CURRENCY;
    const newGroup: Group = {
      id: generateId(),
      name,
      description,
      currency: currency.code,
      currencySymbol: currency.symbol,
      members: [],
      expenses: [],
      settlements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setGroups((prev) => [...prev, newGroup]);
    setCurrentGroupIdState(newGroup.id);
    return newGroup;
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? { ...group, ...updates, updatedAt: new Date() }
          : group
      )
    );
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
    if (currentGroupId === id) {
      setCurrentGroupIdState(null);
    }
  };

  const setCurrentGroup = (id: string | null) => {
    setCurrentGroupIdState(id);
  };

  const getCurrentGroup = (): Group | null => {
    return groups.find((g) => g.id === currentGroupId) || null;
  };

  const getGroupSummary = (groupId: string): GroupSummary | null => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return null;

    const balances = calculateBalances(group);
    const simplifiedDebts = simplifyDebts(balances);
    const totalExpenses = group.expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      group,
      balances,
      simplifiedDebts,
      totalExpenses,
      expenseCount: group.expenses.length,
    };
  };

  // Person operations
  const addPerson = (groupId: string, name: string): Person => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');

    const colorIndex = group.members.length % PERSON_COLORS.length;
    const newPerson: Person = {
      id: generateId(),
      name,
      color: PERSON_COLORS[colorIndex],
      createdAt: new Date(),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: [...g.members, newPerson], updatedAt: new Date() }
          : g
      )
    );

    return newPerson;
  };

  const updatePerson = (groupId: string, personId: string, updates: Partial<Person>) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((p) =>
                p.id === personId ? { ...p, ...updates } : p
              ),
              updatedAt: new Date(),
            }
          : g
      )
    );
  };

  const removePerson = (groupId: string, personId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // Check if person is involved in any expenses
    const hasExpenses = group.expenses.some(
      (e) => e.paidBy === personId || e.splits.some((s) => s.personId === personId)
    );

    if (hasExpenses) {
      alert('Cannot remove this person. They are involved in existing expenses.');
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.filter((p) => p.id !== personId),
              updatedAt: new Date(),
            }
          : g
      )
    );
  };

  // Expense operations
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: new Date(),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === expense.groupId
          ? { ...g, expenses: [...g.expenses, newExpense], updatedAt: new Date() }
          : g
      )
    );

    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        expenses: g.expenses.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
        updatedAt: new Date(),
      }))
    );
  };

  const deleteExpense = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        expenses: g.expenses.filter((e) => e.id !== id),
        updatedAt: new Date(),
      }))
    );
  };

  // Settlement operations
  const addSettlement = (settlement: Omit<Settlement, 'id' | 'settledAt'>): Settlement => {
    const newSettlement: Settlement = {
      ...settlement,
      id: generateId(),
      settledAt: new Date(),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === settlement.groupId
          ? { ...g, settlements: [...g.settlements, newSettlement], updatedAt: new Date() }
          : g
      )
    );

    return newSettlement;
  };

  const value: AppContextType = {
    groups,
    currentGroupId,
    createGroup,
    updateGroup,
    deleteGroup,
    setCurrentGroup,
    getCurrentGroup,
    getGroupSummary,
    addPerson,
    updatePerson,
    removePerson,
    addExpense,
    updateExpense,
    deleteExpense,
    addSettlement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
