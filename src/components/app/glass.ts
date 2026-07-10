import type { CSSProperties } from 'react';

/** CSS custom-property references for the Liquid Glass theme (see index.css). */
export const V = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  surface3: 'var(--surface-3)',
  text: 'var(--text)',
  dim: 'var(--dim)',
  faint: 'var(--faint)',
  border: 'var(--border-c)',
  accent: 'var(--accent-c)',
  accentInk: 'var(--accent-ink)',
  pos: 'var(--pos)',
  neg: 'var(--neg)',
  ambient: 'var(--ambient)',
  glassBg: 'var(--glass-bg)',
  glassBorder: 'var(--glass-border)',
  glassHi: 'var(--glass-hi)',
  glassShadow: 'var(--glass-shadow)',
} as const;

export const backdrop = 'blur(var(--glass-blur)) saturate(var(--glass-sat))';

/** Base frosted-glass panel decoration. */
export const glassPanel: CSSProperties = {
  background: V.glassBg,
  WebkitBackdropFilter: backdrop,
  backdropFilter: backdrop,
  border: `1px solid ${V.glassBorder}`,
  boxShadow: `${V.glassShadow}, inset 0 1px 0 ${V.glassHi}`,
};

/** Solid surface card. */
export const surfaceCard: CSSProperties = {
  background: V.surface,
  border: `1px solid ${V.border}`,
};

export function chipStyle(active: boolean): CSSProperties {
  return active
    ? {
        padding: '9px 14px',
        borderRadius: 12,
        background: V.accent,
        color: V.accentInk,
        fontWeight: 700,
        fontSize: 13,
        border: '1px solid transparent',
        display: 'inline-flex',
        alignItems: 'center',
      }
    : {
        padding: '9px 14px',
        borderRadius: 12,
        background: V.surface2,
        color: V.text,
        fontWeight: 600,
        fontSize: 13,
        border: `1px solid ${V.border}`,
        display: 'inline-flex',
        alignItems: 'center',
      };
}

export function segStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '9px 8px',
    borderRadius: 11,
    background: active ? V.accent : 'transparent',
    color: active ? V.accentInk : V.dim,
    fontWeight: active ? 700 : 650,
    fontSize: 13.5,
    transition: 'all .18s',
  };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const two = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  return (two || name.slice(0, 2)).toUpperCase();
}

/** Primary accent action button. */
export const primaryBtn: CSSProperties = {
  width: '100%',
  padding: 16,
  borderRadius: 16,
  background: V.accent,
  color: V.accentInk,
  fontWeight: 700,
  fontSize: 16,
  boxShadow: '0 8px 22px rgba(31,182,171,.32)',
};
