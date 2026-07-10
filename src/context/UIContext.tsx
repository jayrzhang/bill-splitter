import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type GlassStyle = 'frost' | 'clear';

interface UIContextType {
  theme: ThemeMode;
  glass: GlassStyle;
  onboarded: boolean;
  defaultCurrency: string;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setGlass: (g: GlassStyle) => void;
  setDefaultCurrency: (code: string) => void;
  finishOnboarding: () => void;
  replayOnboarding: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const KEYS = {
  theme: 'splitaa_theme',
  glass: 'splitaa_glass',
  onboarded: 'splitaa_onboarded',
  currency: 'splitaa_default_currency',
} as const;

function readStored<T extends string>(key: string, fallback: T, allowed?: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && (!allowed || allowed.includes(v))) return v;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = readStored<ThemeMode>(KEYS.theme, '' as ThemeMode, ['light', 'dark']);
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [glass, setGlassState] = useState<GlassStyle>(() =>
    readStored<GlassStyle>(KEYS.glass, 'frost', ['frost', 'clear'])
  );
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEYS.onboarded) === 'true';
    } catch {
      return false;
    }
  });
  const [defaultCurrency, setDefaultCurrencyState] = useState<string>(() =>
    readStored<string>(KEYS.currency, 'USD')
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.theme, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.glass, glass);
    } catch {
      /* ignore */
    }
  }, [glass]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.currency, defaultCurrency);
    } catch {
      /* ignore */
    }
  }, [defaultCurrency]);

  const value: UIContextType = {
    theme,
    glass,
    onboarded,
    defaultCurrency,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((t) => (t === 'light' ? 'dark' : 'light')),
    setGlass: setGlassState,
    setDefaultCurrency: setDefaultCurrencyState,
    finishOnboarding: () => {
      setOnboarded(true);
      try {
        localStorage.setItem(KEYS.onboarded, 'true');
      } catch {
        /* ignore */
      }
    },
    replayOnboarding: () => {
      setOnboarded(false);
      try {
        localStorage.setItem(KEYS.onboarded, 'false');
      } catch {
        /* ignore */
      }
    },
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
}
