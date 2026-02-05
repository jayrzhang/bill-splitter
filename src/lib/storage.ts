import type { Group } from '@/types';

const STORAGE_KEYS = {
  GROUPS: 'billsplit_groups',
  CURRENT_GROUP_ID: 'billsplit_current_group_id',
} as const;

/**
 * Storage layer with versioning and migration support
 */
export class StorageService {
  /**
   * Load all groups from storage
   */
  static loadGroups(): Group[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Hydrate dates
      return parsed.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
        startDate: group.startDate ? new Date(group.startDate) : undefined,
        endDate: group.endDate ? new Date(group.endDate) : undefined,
        members: group.members.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
        expenses: group.expenses.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        })),
        settlements: group.settlements.map((s: any) => ({
          ...s,
          settledAt: new Date(s.settledAt),
        })),
      }));
    } catch (error) {
      console.error('Failed to load groups:', error);
      return [];
    }
  }

  /**
   * Save all groups to storage
   */
  static saveGroups(groups: Group[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some old groups.');
      }
    }
  }

  /**
   * Load current group ID
   */
  static loadCurrentGroupId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_GROUP_ID);
    } catch (error) {
      console.error('Failed to load current group ID:', error);
      return null;
    }
  }

  /**
   * Save current group ID
   */
  static saveCurrentGroupId(groupId: string | null): void {
    try {
      if (groupId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_GROUP_ID, groupId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_GROUP_ID);
      }
    } catch (error) {
      console.error('Failed to save current group ID:', error);
    }
  }

  /**
   * Export data for backup
   */
  static exportData(): string {
    const groups = this.loadGroups();

    return JSON.stringify(
      {
        version: '1.0.0',
        exportedAt: new Date(),
        groups,
      },
      null,
      2
    );
  }

  /**
   * Import data from backup
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.groups) {
        this.saveGroups(data.groups);
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}
