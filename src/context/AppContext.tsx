import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Group, Person, Expense, Settlement, GroupSummary, SplitTemplate } from '@/types';
import { StorageService } from '@/lib/storage';
import { generateId, toIsoDate, advanceIsoDate } from '@/lib/utils';
import { calculateBalances, simplifyDebts } from '@/lib/calculations';
import { PERSON_COLORS, DEFAULT_CURRENCY, CURRENCIES, type GroupCategoryId } from '@/lib/constants';
import { decompressFromEncodedURIComponent } from 'lz-string';

interface AppContextType {
  // State
  groups: Group[];
  currentGroupId: string | null;

  // Group operations
  createGroup: (name: string, description?: string, currencyCode?: string, category?: GroupCategoryId, startDate?: Date, endDate?: Date, memberNames?: string[]) => Group;
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

  // Data ownership
  exportAllData: () => string;
  importAllData: (json: string) => { ok: boolean; count: number; error?: string };

  // Split templates (per group)
  addSplitTemplate: (groupId: string, template: Omit<SplitTemplate, 'id'>) => void;
  deleteSplitTemplate: (groupId: string, templateId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    const loadedGroups = StorageService.loadGroups();
    console.log('[AppContext] Loading groups from storage:', loadedGroups);
    setGroups(loadedGroups);

    const loadedCurrentGroupId = StorageService.loadCurrentGroupId();
    setCurrentGroupIdState(loadedCurrentGroupId);

    // Check for shared group data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    const isReadOnly = urlParams.get('readonly') === 'true';

    if (shareData) {
      try {
        // Decompress and parse the shared group data (using lz-string compression)
        const decompressedData = decompressFromEncodedURIComponent(shareData);
        if (!decompressedData) {
          throw new Error('Failed to decompress share data');
        }
        const sharedGroup: Group = JSON.parse(decompressedData);

        // Hydrate dates
        sharedGroup.createdAt = new Date(sharedGroup.createdAt);
        sharedGroup.updatedAt = new Date(sharedGroup.updatedAt);
        sharedGroup.members = sharedGroup.members.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
        sharedGroup.expenses = sharedGroup.expenses.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        }));
        sharedGroup.settlements = sharedGroup.settlements.map((s: any) => ({
          ...s,
          settledAt: new Date(s.settledAt),
        }));

        if (isReadOnly) {
          // Read-only mode: Store in sessionStorage (temporary, doesn't persist)
          sessionStorage.setItem(`readonly_group_${sharedGroup.id}`, JSON.stringify(sharedGroup));
          window.location.href = `/group/${sharedGroup.id}?readonly=true`;
          return;
        }

        // Editable mode: Check if group already exists
        const groupExists = loadedGroups.some(g => g.id === sharedGroup.id);

        if (!groupExists) {
          // Prompt user to import
          if (confirm(`Import group "${sharedGroup.name}"? This will add it to your local storage.`)) {
            const updatedGroups = [...loadedGroups, sharedGroup];
            setGroups(updatedGroups);
            // CRITICAL: Save to localStorage synchronously BEFORE navigation
            // Otherwise the page reloads before React's useEffect can save
            StorageService.saveGroups(updatedGroups);
            // Navigate to the imported group
            window.location.href = `/group/${sharedGroup.id}`;
            return;
          }
        } else {
          // Group already exists
          if (confirm(`Group "${sharedGroup.name}" already exists. View it?`)) {
            window.location.href = `/group/${sharedGroup.id}`;
            return;
          }
        }

        // Clean up URL if user declined
        window.history.replaceState({}, '', '/');
      } catch (error) {
        console.error('Failed to import shared group:', error);
        alert('Failed to import group. The share link may be invalid.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save groups to storage whenever they change (after initial load)
  useEffect(() => {
    if (isInitialized) {
      console.log('[AppContext] Saving groups to storage:', groups);
      StorageService.saveGroups(groups);
    }
  }, [groups, isInitialized]);

  // Save current group ID whenever it changes (after initial load)
  useEffect(() => {
    if (isInitialized) {
      StorageService.saveCurrentGroupId(currentGroupId);
    }
  }, [currentGroupId, isInitialized]);

  // Materialize any due recurring expenses once, on load. Each recurring expense
  // seeds concrete (non-recurring) occurrences up to today, then advances its own
  // nextDate. Runs client-side since there is no server to generate them.
  useEffect(() => {
    if (!isInitialized) return;
    const todayIso = toIsoDate(new Date());
    setGroups((prev) => {
      let changed = false;
      const next = prev.map((group) => {
        const spawned: Expense[] = [];
        const expenses = group.expenses.map((e) => {
          if (!e.recurrence) return e;
          let nextIso = e.recurrence.nextDate;
          let guard = 0;
          while (nextIso <= todayIso && guard < 60) {
            guard++;
            const [y, m, d] = nextIso.split('-').map(Number);
            spawned.push({
              ...e,
              id: generateId(),
              date: new Date(y, m - 1, d), // local calendar day, displays correctly
              createdAt: new Date(),
              recurrence: undefined,
            });
            nextIso = advanceIsoDate(nextIso, e.recurrence.frequency);
          }
          if (guard > 0) {
            changed = true;
            return { ...e, recurrence: { ...e.recurrence, nextDate: nextIso } };
          }
          return e;
        });
        return spawned.length ? { ...group, expenses: [...expenses, ...spawned] } : { ...group, expenses };
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Group operations
  const createGroup = (name: string, description?: string, currencyCode?: string, category?: GroupCategoryId, startDate?: Date, endDate?: Date, memberNames?: string[]): Group => {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || DEFAULT_CURRENCY;
    const members: Person[] = (memberNames || [])
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((n, i) => ({
        id: generateId(),
        name: n,
        color: PERSON_COLORS[i % PERSON_COLORS.length],
        createdAt: new Date(),
      }));
    const newGroup: Group = {
      id: generateId(),
      name,
      description,
      category,
      startDate,
      endDate,
      currency: currency.code,
      currencySymbol: currency.symbol,
      members,
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

  // Data ownership: full local backup export / import (merge by group id)
  const exportAllData = (): string =>
    JSON.stringify({ app: 'SplitAA', version: '1.0.0', exportedAt: new Date().toISOString(), groups }, null, 2);

  const importAllData = (json: string): { ok: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(json);
      const incoming: any[] = Array.isArray(data) ? data : data?.groups;
      if (!Array.isArray(incoming)) return { ok: false, count: 0, error: 'No groups found in file' };
      const hydrated: Group[] = incoming.map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt),
        startDate: g.startDate ? new Date(g.startDate) : undefined,
        endDate: g.endDate ? new Date(g.endDate) : undefined,
        members: (g.members || []).map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })),
        expenses: (g.expenses || []).map((e: any) => ({ ...e, date: new Date(e.date), createdAt: new Date(e.createdAt) })),
        settlements: (g.settlements || []).map((s: any) => ({ ...s, settledAt: new Date(s.settledAt) })),
      }));
      setGroups((prev) => {
        const map = new Map(prev.map((g) => [g.id, g]));
        hydrated.forEach((g) => map.set(g.id, g)); // imported groups win on id collision
        return Array.from(map.values());
      });
      return { ok: true, count: hydrated.length };
    } catch (e) {
      return { ok: false, count: 0, error: e instanceof Error ? e.message : 'Could not read file' };
    }
  };

  // Split templates
  const addSplitTemplate = (groupId: string, template: Omit<SplitTemplate, 'id'>) => {
    const newTemplate: SplitTemplate = { ...template, id: generateId() };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, splitTemplates: [...(g.splitTemplates || []), newTemplate], updatedAt: new Date() }
          : g
      )
    );
  };

  const deleteSplitTemplate = (groupId: string, templateId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, splitTemplates: (g.splitTemplates || []).filter((t) => t.id !== templateId), updatedAt: new Date() }
          : g
      )
    );
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
    exportAllData,
    importAllData,
    addSplitTemplate,
    deleteSplitTemplate,
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
