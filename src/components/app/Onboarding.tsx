import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUI } from '@/context/UIContext';
import { redesignStrings } from '@/i18n/redesignStrings';
import { CURRENCIES } from '@/lib/constants';
import { V, glassPanel, chipStyle, primaryBtn } from './glass';

const LANG_ORDER = ['en', 'ja', 'zh'] as const;
const LANG_LABEL: Record<string, string> = { en: 'EN', ja: '日本語', zh: '中文' };

export default function Onboarding() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme, defaultCurrency, setDefaultCurrency, finishOnboarding } = useUI();
  const tx = redesignStrings[language];
  const [step, setStep] = useState(1);

  const cycleLang = () => setLanguage(LANG_ORDER[(LANG_ORDER.indexOf(language) + 1) % 3]);
  const symbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;
  const currencyOptions = ['USD', 'JPY', 'EUR', 'GBP', 'CNY'];

  const pillBtn = {
    padding: '7px 12px',
    borderRadius: 999,
    ...glassPanel,
    boxShadow: `inset 0 1px 0 ${V.glassHi}`,
    fontSize: 12,
    fontWeight: 600,
  } as const;

  return (
    <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 24px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/splitaa-logo.svg" alt="" width={30} height={30} style={{ display: 'block', flex: 'none' }} />
          <span style={{ fontWeight: 700, letterSpacing: '-.02em' }}>SplitAA</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={cycleLang} aria-label={tx.a11yCycleLanguage} style={pillBtn}>{LANG_LABEL[language]}</button>
          <button onClick={toggleTheme} aria-label={tx.a11yToggleTheme} style={{ ...pillBtn, width: 34, height: 34, padding: 0, fontSize: 14 }}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span></button>
        </div>
      </div>

      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'dc-screenIn .4s ease' }}>
          <div style={{ position: 'relative', height: 210, marginBottom: 26 }}>
            <div style={{ position: 'absolute', left: '6%', top: 26, width: 210, height: 130, borderRadius: 22, ...glassPanel, transform: 'rotate(-7deg)', padding: 16 }}>
              <div style={{ fontSize: 11, color: V.dim, fontWeight: 600 }}>{tx.groups}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginTop: 6 }}>¥73,000</div>
              <div style={{ display: 'flex', marginTop: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1fb6ab', border: `2px solid ${V.surface}` }} />
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e0644a', border: `2px solid ${V.surface}`, marginLeft: -7 }} />
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#7c6cf0', border: `2px solid ${V.surface}`, marginLeft: -7 }} />
              </div>
            </div>
            <div style={{ position: 'absolute', right: '4%', top: 78, width: 190, height: 118, borderRadius: 22, ...glassPanel, transform: 'rotate(6deg)', padding: 16 }}>
              <div style={{ fontSize: 11, color: V.dim, fontWeight: 600 }}>{tx.settleUp}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginTop: 6, color: V.pos }}>+$128.40</div>
              <div style={{ height: 6, borderRadius: 3, background: V.accent, width: '70%', marginTop: 16, opacity: 0.85 }} />
            </div>
          </div>
          <h1 style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-.035em', fontWeight: 800, textWrap: 'balance' } as React.CSSProperties}>{tx.welcomeTitle}</h1>
          <p style={{ marginTop: 14, color: V.dim, fontSize: 16, lineHeight: 1.5, maxWidth: '32ch' }}>{tx.welcomeSub}</p>
          <button onClick={() => setStep(2)} style={{ ...primaryBtn, marginTop: 28, boxShadow: '0 8px 22px rgba(31,182,171,.35)' }}>{tx.getStarted}</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'dc-screenIn .4s ease' }}>
          <h2 style={{ fontSize: 26, letterSpacing: '-.03em', fontWeight: 800 }}>{tx.setupTitle}</h2>
          <p style={{ marginTop: 8, color: V.dim, fontSize: 15 }}>{tx.setupSub}</p>
          <label style={{ display: 'block', marginTop: 26, fontSize: 13, fontWeight: 600, color: V.dim }}>{tx.defaultCurrency}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {currencyOptions.map((c) => (
              <button key={c} onClick={() => setDefaultCurrency(c)} style={chipStyle(defaultCurrency === c)}>
                {c} {symbol(c)}
              </button>
            ))}
          </div>
          <button onClick={finishOnboarding} style={{ ...primaryBtn, marginTop: 30, boxShadow: '0 8px 22px rgba(31,182,171,.35)' }}>{tx.continue}</button>
          <button onClick={finishOnboarding} style={{ marginTop: 12, width: '100%', padding: 12, color: V.dim, fontWeight: 600, fontSize: 14 }}>{tx.skip}</button>
        </div>
      )}
    </div>
  );
}
