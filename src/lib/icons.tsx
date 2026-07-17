/**
 * Line-art SVG icons for the Liquid Glass UI.
 * Paths ported from the design handoff (SplitAA.dc.html) plus a few
 * added so every existing expense/group category maps to a glyph.
 */
import type { CSSProperties } from 'react';
import type { ExpenseCategoryId, GroupCategoryId } from './constants';

const PATHS: Record<string, string[]> = {
  food: ['M4 3v6a2 2 0 0 0 2 2v9', 'M8 3v8', 'M16 3c-1.2 1.2-2 3-2 5s.8 2.5 2 2.5v9.5'],
  travel: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],
  home: ['M3 10.2 12 3l9 7.2', 'M5 9.4V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.4'],
  transport: [
    'M5 11l1.6-4.6A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.4L19 11',
    'M3 11h18v5a1 1 0 0 1-1 1h-1M4 17H3v-6',
    'M7.5 17h9',
    'M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  ],
  fun: ['M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7z'],
  utilities: ['M13 2 4 13h7l-1 9 9-11h-7z'],
  other: [
    'M20.6 12.6 12.6 20.6a1.4 1.4 0 0 1-2 0L3 13V4a1 1 0 0 1 1-1h9l7.6 7.6a1.4 1.4 0 0 1 0 2Z',
    'M7.5 7.5h.01',
  ],
  shopping: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  work: [
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z',
    'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  ],
  heart: ['M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z'],
  people: [
    'M16 21v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21',
    'M9 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-1.5a4 4 0 0 0-3-3.87',
    'M16 3.63a4 4 0 0 1 0 7.75',
  ],
  ui_groups: [
    'M16 21v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21',
    'M9 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-1.5a4 4 0 0 0-3-3.87',
    'M16 3.63a4 4 0 0 1 0 7.75',
  ],
  ui_activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  ui_settings: [
    'M4 21v-7',
    'M4 10V3',
    'M12 21v-9',
    'M12 8V3',
    'M20 21v-5',
    'M20 12V3',
    'M1 14h6',
    'M9 8h6',
    'M17 16h6',
  ],
  ui_edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  ui_trash: [
    'M3 6h18',
    'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2',
    'M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6',
    'M10 11v6',
    'M14 11v6',
  ],
  ui_warn: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z', 'M12 9v4', 'M12 17h.01'],
  ui_share: [
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  ],
  ui_check: ['M20 6 9 17l-5-5'],
  plus: ['M12 5v14', 'M5 12h14'],
  image: [
    'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
    'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M21 15l-5-5L5 21',
  ],
};

// existing expense category ids -> glyph key
const EXPENSE_ICON: Record<ExpenseCategoryId, string> = {
  food: 'food',
  accommodation: 'home',
  transport: 'transport',
  entertainment: 'fun',
  shopping: 'shopping',
  utilities: 'utilities',
  other: 'other',
};

// existing group category ids -> glyph key
const GROUP_ICON: Record<GroupCategoryId, string> = {
  travel: 'travel',
  dinner: 'food',
  colleagues: 'work',
  roommates: 'home',
  wedding: 'heart',
  other: 'people',
};

export function expenseCatKey(id?: string): string {
  return (id && EXPENSE_ICON[id as ExpenseCategoryId]) || 'other';
}
export function groupCatKey(id?: string): string {
  return (id && GROUP_ICON[id as GroupCategoryId]) || 'people';
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style }: IconProps) {
  const paths = PATHS[name] || PATHS.other;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        color,
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        display: 'block',
        flex: 'none',
        ...style,
      }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
