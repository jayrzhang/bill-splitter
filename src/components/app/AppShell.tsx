import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUI } from '@/context/UIContext';
import { redesignStrings } from '@/i18n/redesignStrings';
import { calculateBalances, simplifyDebts, calculateEqualSplits, validateSplits } from '@/lib/calculations';
import { CURRENCIES, EXPENSE_CATEGORIES, GROUP_CATEGORIES, PERSON_COLORS, suggestRate } from '@/lib/constants';
import type { ExpenseCategoryId, GroupCategoryId } from '@/lib/constants';
import type { Group, Split, Recurrence, SplitType, SplitTemplate } from '@/types';
import { compressToEncodedURIComponent } from 'lz-string';
import { toIsoDate, advanceIsoDate } from '@/lib/utils';
import { Icon, expenseCatKey, groupCatKey } from '@/lib/icons';
import { V, glassPanel, surfaceCard, chipStyle, segStyle, initials, primaryBtn, backdrop } from './glass';
import Onboarding from './Onboarding';

type View = 'home' | 'group' | 'settle' | 'invite' | 'activity' | 'settings' | 'create';

interface Draft {
  id?: string;
  groupId: string;
  locked: boolean;
  amount: string;
  desc: string;
  category: ExpenseCategoryId;
  paidBy: string;
  splitType: SplitType;
  shares: Record<string, string>; // per-member raw input for the active mode (amount / % / weight), in group currency
  note: string;
  receipt: string; // compressed JPEG data URL, or '' when none
  repeat: 'none' | 'weekly' | 'monthly';
  currency: string; // the currency the amount is entered in (may differ from the group's)
  fxRate: string; // group-currency units per 1 unit of `currency` (editable)
}

interface ConfirmCfg {
  title: string;
  message: string;
  danger?: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

interface LocalMember {
  id: string;
  name: string;
  color: string;
}

const LANG_LABEL: Record<string, string> = { en: 'EN', ja: '日本語', zh: '中文' };

export default function AppShell({ initialGroupId, readOnly }: { initialGroupId?: string; readOnly?: boolean }) {
  const app = useApp();
  const { groups, currentGroupId, setCurrentGroup } = app;
  const { language, setLanguage, t } = useLanguage();
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const ui = useUI();
  const { theme, glass, onboarded, defaultCurrency, toggleTheme } = ui;
  const tx = redesignStrings[language];

  const [view, setView] = useState<View>('home');
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmCfg | null>(null);
  const [copied, setCopied] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [tplSaving, setTplSaving] = useState(false);
  const [tplName, setTplName] = useState('');
  const [readOnlyGroup, setReadOnlyGroup] = useState<Group | null>(null);

  // create / edit group form
  const [cgEditId, setCgEditId] = useState<string | null>(null);
  const [cgName, setCgName] = useState('');
  const [cgCat, setCgCat] = useState<GroupCategoryId>('travel');
  const [cgCur, setCgCur] = useState('USD');
  const [cgMembers, setCgMembers] = useState<LocalMember[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // open a group deep-linked via the URL exactly once
  const didInit = useRef(false);
  useEffect(() => {
    if (readOnly || didInit.current || !initialGroupId) return;
    const g = groups.find((x) => x.id === initialGroupId);
    if (g) {
      didInit.current = true;
      setCurrentGroup(initialGroupId);
      setView('group');
    }
  }, [groups, initialGroupId, readOnly, setCurrentGroup]);

  // load a read-only snapshot from sessionStorage
  useEffect(() => {
    if (!readOnly || !initialGroupId) return;
    const raw = sessionStorage.getItem(`readonly_group_${initialGroupId}`);
    if (!raw) return;
    try {
      const g = JSON.parse(raw) as Group;
      g.createdAt = new Date(g.createdAt);
      g.updatedAt = new Date(g.updatedAt);
      g.members = g.members.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }));
      g.expenses = g.expenses.map((e) => ({ ...e, date: new Date(e.date), createdAt: new Date(e.createdAt) }));
      g.settlements = g.settlements.map((s) => ({ ...s, settledAt: new Date(s.settledAt) }));
      setReadOnlyGroup(g);
    } catch (err) {
      console.error('Failed to parse read-only group', err);
    }
  }, [readOnly, initialGroupId]);

  // ---------- helpers ----------
  const symbolOf = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;
  const fmt = (amount: number, symbol: string) => `${symbol}${Math.abs(amount).toFixed(symbol === '¥' ? 0 : 2)}`;
  const dateStr = (d: Date) =>
    new Intl.DateTimeFormat({ en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }[language], { month: 'short', day: 'numeric' }).format(d);
  const expCatColor = (id?: string) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.color || '#8a8f98';
  const groupCatColor = (id?: string) => GROUP_CATEGORIES.find((c) => c.id === id)?.color || '#8a8f98';
  const memberName = (g: Group, id: string) => g.members.find((m) => m.id === id)?.name || '';
  const shareUrlFor = (g: Group) => {
    const data = {
      id: g.id, name: g.name, description: g.description, category: g.category,
      currency: g.currency, currencySymbol: g.currencySymbol,
      members: g.members, expenses: g.expenses, settlements: g.settlements, splitTemplates: g.splitTemplates,
      createdAt: g.createdAt, updatedAt: g.updatedAt,
    };
    return `${window.location.origin}/?share=${compressToEncodedURIComponent(JSON.stringify(data))}&readonly=true`;
  };

  const activeGroup: Group | null = readOnly ? readOnlyGroup : groups.find((g) => g.id === currentGroupId) || null;

  // ---------- navigation ----------
  const go = (v: View) => setView(v);
  const openGroup = (id: string) => {
    setCurrentGroup(id);
    setView('group');
  };
  const back = () => {
    if (view === 'settle' || view === 'invite') setView('group');
    else if (view === 'create') {
      setView(cgEditId ? 'group' : 'home');
      setCgEditId(null);
    } else setView('home');
  };

  // ---------- confirm dialog ----------
  const askConfirm = (cfg: ConfirmCfg) => {
    setGroupMenuOpen(false);
    setConfirm(cfg);
  };

  // ---------- expense sheet ----------
  const openAdd = () => {
    const eligible = groups.filter((g) => g.members.length >= 2);
    const locked = view === 'group' && !!activeGroup;
    const gid = locked && activeGroup ? activeGroup.id : eligible[0]?.id || groups[0]?.id || '';
    const g = groups.find((x) => x.id === gid);
    setDraft({
      groupId: gid,
      locked,
      amount: '',
      desc: '',
      category: 'food',
      paidBy: g?.members[0]?.id || '',
      splitType: 'equal',
      shares: {},
      note: '',
      receipt: '',
      repeat: 'none',
      currency: g?.currency || 'USD',
      fxRate: '1',
    });
    setAddOpen(true);
  };
  const closeAdd = () => {
    setAddOpen(false);
    setDraft(null);
    setTplSaving(false);
    setTplName('');
  };
  const patchDraft = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  // downscale + re-encode a chosen photo to a small JPEG data URL so receipts
  // don't blow the localStorage quota
  const onReceiptFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        patchDraft({ receipt: canvas.toDataURL('image/jpeg', 0.7) });
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };
  // the amount to split, in the GROUP currency (entered amount * fx rate)
  const draftTotal = () => {
    if (!draft) return 0;
    return (parseFloat(draft.amount) || 0) * (parseFloat(draft.fxRate) || 1);
  };
  // apply a saved split template to the current draft
  const applyTemplate = (t: SplitTemplate) => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g) return;
    if (t.splitType === 'equal') {
      patchDraft({ splitType: 'equal', shares: {} });
      return;
    }
    const shares: Record<string, string> = {};
    g.members.forEach((m) => {
      const v = t.values[m.id];
      shares[m.id] = v !== undefined ? String(v) : t.splitType === 'shares' ? '1' : '0';
    });
    patchDraft({ splitType: t.splitType, shares });
  };
  // save the draft's current split config as a reusable, group-scoped template
  const saveTemplate = () => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g) return;
    const name = tplName.trim();
    if (!name) return;
    const values: Record<string, number> = {};
    if (draft.splitType !== 'equal') {
      g.members.forEach((m) => (values[m.id] = parseFloat(draft.shares[m.id]) || 0));
    }
    app.addSplitTemplate(g.id, { name, splitType: draft.splitType, values });
    setTplSaving(false);
    setTplName('');
  };
  // pick the expense's entry currency and prefill a suggested rate to the group currency
  const setDraftCurrency = (code: string) => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    const groupCur = g?.currency || 'USD';
    patchDraft({ currency: code, fxRate: code === groupCur ? '1' : String(suggestRate(code, groupCur)) });
  };
  // clean numeric string for a share (JPY/CNY have no decimals for amount modes)
  const shareNumStr = (val: number, symbol: string) => (symbol === '¥' ? String(Math.round(val)) : String(Number(val.toFixed(2))));
  const pctStr = (val: number) => String(Number(val.toFixed(2)));
  // seed the per-member inputs for the chosen split mode
  const setMode = (mode: SplitType) => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g || mode === 'equal') {
      setDraft({ ...draft, splitType: mode });
      return;
    }
    const ids = g.members.map((m) => m.id);
    const total = draftTotal();
    const shares: Record<string, string> = {};
    if (mode === 'custom') {
      (total > 0 ? calculateEqualSplits(total, ids) : ids.map((id) => ({ personId: id, amount: 0 }))).forEach((s) => {
        shares[s.personId] = String(s.amount);
      });
    } else if (mode === 'percentage') {
      const base = Math.floor((10000 / ids.length)) / 100; // even %, 2 decimals
      ids.forEach((id, i) => (shares[id] = pctStr(i === 0 ? 100 - base * (ids.length - 1) : base)));
    } else if (mode === 'adjustment') {
      ids.forEach((id) => (shares[id] = '0')); // no adjustment = equal split
    } else {
      ids.forEach((id) => (shares[id] = '1')); // equal weights
    }
    setDraft({ ...draft, splitType: mode, shares });
  };
  const othersShareSum = (id: string) => {
    if (!draft) return 0;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g) return 0;
    return g.members.reduce((s, m) => (m.id === id ? s : s + (parseFloat(draft.shares[m.id]) || 0)), 0);
  };
  // set a member's input, clamped so amounts can't exceed the total / percentages can't exceed 100
  const setDraftShare = (id: string, raw: string) => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    // adjustment allows a leading minus; all other modes are non-negative numbers
    let v = draft.splitType === 'adjustment'
      ? raw.replace(/[^0-9.-]/g, '').replace(/(?!^)-/g, '')
      : raw.replace(/[^0-9.]/g, '');
    const num = parseFloat(v);
    if (g && !isNaN(num)) {
      if (draft.splitType === 'custom') {
        const max = Math.max(0, draftTotal() - othersShareSum(id));
        if (num > max) v = shareNumStr(max, g.currencySymbol);
      } else if (draft.splitType === 'percentage') {
        const max = Math.max(0, 100 - othersShareSum(id));
        if (num > max) v = pctStr(max);
      }
      // shares (weights) & adjustment: no clamp
    }
    patchDraft({ shares: { ...draft.shares, [id]: v } });
  };
  // fill one member's field with the leftover (amount for custom, % for percentage)
  const fillRemainingShare = (id: string) => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g) return;
    if (draft.splitType === 'percentage') {
      patchDraft({ shares: { ...draft.shares, [id]: pctStr(Math.max(0, 100 - othersShareSum(id))) } });
    } else {
      const total = draftTotal();
      patchDraft({ shares: { ...draft.shares, [id]: shareNumStr(Math.max(0, total - othersShareSum(id)), g.currencySymbol) } });
    }
  };
  const openEditExpense = (g: Group, expenseId: string) => {
    const e = g.expenses.find((x) => x.id === expenseId);
    if (!e) return;
    const shares: Record<string, string> = {};
    if ((e.splitType === 'percentage' || e.splitType === 'shares' || e.splitType === 'adjustment') && e.splitValues) {
      Object.entries(e.splitValues).forEach(([id, v]) => (shares[id] = String(v)));
    } else {
      e.splits.forEach((s) => (shares[s.personId] = String(s.amount)));
    }
    setCurrentGroup(g.id);
    const foreign = !!e.originalCurrency && e.originalCurrency !== g.currency;
    setDraft({
      id: e.id, groupId: g.id, locked: true,
      amount: String(foreign ? e.originalAmount ?? e.amount : e.amount), desc: e.description,
      category: (e.category as ExpenseCategoryId) || 'other', paidBy: e.paidBy, splitType: e.splitType, shares, note: e.note || '',
      receipt: e.receipt || '',
      repeat: e.recurrence?.frequency || 'none',
      currency: e.originalCurrency || g.currency,
      fxRate: e.fxRate ? String(e.fxRate) : '1',
    });
    setAddOpen(true);
  };
  const saveExpense = () => {
    if (!draft) return;
    const g = groups.find((x) => x.id === draft.groupId);
    if (!g || g.members.length < 2) return;
    const origAmt = parseFloat(draft.amount);
    if (!origAmt || origAmt <= 0) return;
    const foreign = draft.currency !== g.currency;
    const rate = foreign ? parseFloat(draft.fxRate) || 0 : 1;
    if (foreign && rate <= 0) return;
    const amt = Number((origAmt * rate).toFixed(2)); // group-currency amount used for splits/balances
    if (amt <= 0) return;
    const ids = g.members.map((m) => m.id);
    // resolve final split amounts (+ raw values for percentage/shares so edit reopens)
    const fixRounding = (arr: Split[]) => {
      const sum = arr.reduce((s, x) => s + x.amount, 0);
      const diff = Number((amt - sum).toFixed(2));
      if (diff !== 0 && arr.length) arr[0].amount = Number((arr[0].amount + diff).toFixed(2));
    };
    let splits: Split[];
    let splitValues: Record<string, number> | undefined;
    if (draft.splitType === 'equal') {
      splits = calculateEqualSplits(amt, ids);
    } else if (draft.splitType === 'custom') {
      splits = ids.map((id) => ({ personId: id, amount: parseFloat(draft.shares[id]) || 0 }));
      if (!validateSplits(amt, splits)) return;
    } else if (draft.splitType === 'percentage') {
      const pct = ids.map((id) => parseFloat(draft.shares[id]) || 0);
      if (Math.abs(pct.reduce((a, b) => a + b, 0) - 100) > 0.01) return;
      splits = ids.map((id, i) => ({ personId: id, amount: Number(((amt * pct[i]) / 100).toFixed(2)) }));
      fixRounding(splits);
      splitValues = Object.fromEntries(ids.map((id, i) => [id, pct[i]]));
    } else if (draft.splitType === 'adjustment') {
      const adj = ids.map((id) => parseFloat(draft.shares[id]) || 0);
      const base = (amt - adj.reduce((a, b) => a + b, 0)) / ids.length;
      splits = ids.map((id, i) => ({ personId: id, amount: Number((base + adj[i]).toFixed(2)) }));
      fixRounding(splits);
      splitValues = Object.fromEntries(ids.map((id, i) => [id, adj[i]]));
    } else {
      const w = ids.map((id) => parseFloat(draft.shares[id]) || 0);
      const sumW = w.reduce((a, b) => a + b, 0);
      if (sumW <= 0) return;
      splits = ids.map((id, i) => ({ personId: id, amount: Number(((amt * w[i]) / sumW).toFixed(2)) }));
      fixRounding(splits);
      splitValues = Object.fromEntries(ids.map((id, i) => [id, w[i]]));
    }
    const orig = draft.id ? g.expenses.find((x) => x.id === draft.id) : undefined;
    let recurrence: Recurrence | undefined;
    if (draft.repeat !== 'none') {
      if (orig?.recurrence?.frequency === draft.repeat) {
        recurrence = orig.recurrence; // frequency unchanged → keep existing schedule
      } else {
        const base = orig?.date ? new Date(orig.date) : new Date();
        recurrence = { frequency: draft.repeat, nextDate: advanceIsoDate(toIsoDate(base), draft.repeat) };
      }
    }
    const payload = {
      groupId: g.id,
      description: draft.desc.trim() || EXPENSE_CATEGORIES.find((c) => c.id === draft.category)?.name || draft.category,
      amount: amt,
      category: draft.category,
      paidBy: draft.paidBy || ids[0],
      splitType: draft.splitType,
      splits,
      splitValues,
      originalAmount: foreign ? origAmt : undefined,
      originalCurrency: foreign ? draft.currency : undefined,
      fxRate: foreign ? rate : undefined,
      receipt: draft.receipt || undefined,
      note: draft.note.trim() || undefined,
      recurrence,
      date: new Date(),
    };
    if (draft.id) {
      app.updateExpense(draft.id, payload);
    } else {
      app.addExpense(payload);
    }
    setCurrentGroup(g.id);
    if (view === 'home' || view === 'activity') setView('group');
    closeAdd();
  };
  const requestDeleteExpense = () => {
    if (!draft?.id) return;
    const id = draft.id;
    askConfirm({
      title: tx.deleteExpenseTitle, message: tx.deleteExpenseMsg, confirmLabel: tx.deleteExpense,
      cancelLabel: tx.cancel, showCancel: true, danger: true,
      onConfirm: () => { app.deleteExpense(id); closeAdd(); },
    });
  };

  // ---------- group actions ----------
  const openCreate = () => {
    setCgEditId(null);
    setCgName('');
    setCgCat('travel');
    setCgCur(defaultCurrency);
    setCgMembers([]);
    setNewMember('');
    setView('create');
  };
  const openEditGroup = () => {
    if (!activeGroup) return;
    setCgEditId(activeGroup.id);
    setCgName(activeGroup.name);
    setCgCat((activeGroup.category as GroupCategoryId) || 'other');
    setCgCur(activeGroup.currency);
    setGroupMenuOpen(false);
    setView('create');
  };
  const addLocalMember = () => {
    const n = newMember.trim();
    if (!n) return;
    setCgMembers((prev) => [...prev, { id: 'local-' + Date.now(), name: n, color: PERSON_COLORS[prev.length % PERSON_COLORS.length] }]);
    setNewMember('');
  };
  const createGroupSubmit = () => {
    const n = cgName.trim();
    if (!n) return;
    const currency = CURRENCIES.find((c) => c.code === cgCur);
    if (cgEditId) {
      app.updateGroup(cgEditId, {
        name: n, category: cgCat, currency: cgCur, currencySymbol: currency?.symbol || '$',
      });
      setCurrentGroup(cgEditId);
      setCgEditId(null);
      setView('group');
      return;
    }
    app.createGroup(n, undefined, cgCur, cgCat, undefined, undefined, cgMembers.map((m) => m.name));
    setView('group');
  };
  const requestDeleteGroup = () => {
    if (!activeGroup) return;
    const g = activeGroup;
    const unsettled = simplifyDebts(calculateBalances(g)).length > 0;
    askConfirm({
      title: tx.deleteGroupTitle,
      message: unsettled ? tx.deleteGroupUnsettled(g.name) : tx.deleteGroupMsg(g.name),
      confirmLabel: tx.deleteGroup, cancelLabel: tx.cancel, showCancel: true, danger: true,
      onConfirm: () => { app.deleteGroup(g.id); setView('home'); },
    });
  };
  const requestRemoveMember = (g: Group, personId: string) => {
    const involved = g.expenses.some((e) => e.paidBy === personId || e.splits.some((s) => s.personId === personId));
    const name = memberName(g, personId);
    if (involved) {
      askConfirm({ title: tx.cantRemoveTitle, message: tx.cantRemoveMsg(name), confirmLabel: tx.ok, showCancel: false });
      return;
    }
    askConfirm({
      title: tx.removeMemberTitle, message: tx.removeMemberMsg(name), confirmLabel: tx.remove,
      cancelLabel: tx.cancel, showCancel: true, danger: true,
      onConfirm: () => app.removePerson(g.id, personId),
    });
  };
  const copyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // ---------- data ownership (export / import) ----------
  const download = (filename: string, text: string, mime = 'application/json') => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const stamp = () => new Date().toISOString().slice(0, 10);
  const noticeOk = (title: string, message: string, danger?: boolean) =>
    askConfirm({ title, message, confirmLabel: tx.ok, showCancel: false, danger });
  const exportBackup = () => {
    if (groups.length === 0) return noticeOk(tx.data, tx.nothingToExport);
    download(`splitaa-backup-${stamp()}.json`, app.exportAllData());
  };
  const csvCell = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const exportCsv = () => {
    if (groups.every((g) => g.expenses.length === 0)) return noticeOk(tx.data, tx.nothingToExport);
    const rows: unknown[][] = [['Group', 'Date', 'Description', 'Category', 'Amount', 'Currency', 'Paid by', 'Split', 'Note']];
    groups.forEach((g) =>
      g.expenses.forEach((e) =>
        rows.push([g.name, new Date(e.date).toISOString().slice(0, 10), e.description, e.category || '', e.amount, g.currency, memberName(g, e.paidBy), e.splitType, e.note || ''])
      )
    );
    download(`splitaa-expenses-${stamp()}.csv`, rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv');
  };
  const onImportFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = app.importAllData(String(reader.result || ''));
      if (res.ok) noticeOk(tx.importedTitle, tx.importedMsg(res.count));
      else noticeOk(tx.importFailedTitle, res.error || '', true);
    };
    reader.readAsText(file);
  };

  // Esc closes the top-most overlay (confirm > sheet / group menu)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirm) setConfirm(null);
      else if (addOpen) closeAdd();
      else if (groupMenuOpen) setGroupMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm, addOpen, groupMenuOpen]);

  // ============================================================
  // Onboarding gate
  // ============================================================
  if (!readOnly && !onboarded) {
    return <Shell theme={theme} glass={glass}><Onboarding /></Shell>;
  }

  // ============================================================
  // derived data for the current group
  // ============================================================
  const gBalances = activeGroup ? calculateBalances(activeGroup) : [];
  const gDebts = activeGroup ? simplifyDebts(gBalances) : [];
  const gTotal = activeGroup ? activeGroup.expenses.reduce((s, e) => s + e.amount, 0) : 0;

  // ---------- top bar ----------
  const showBack = ['group', 'settle', 'create', 'invite'].includes(view);
  const showLogo = view === 'home';
  const topTitle =
    view === 'home' ? 'SplitAA'
      : view === 'activity' ? tx.activity
      : view === 'settings' ? tx.settings
      : view === 'create' ? (cgEditId ? tx.editGroup : tx.newGroup)
      : view === 'settle' ? tx.settleUp
      : view === 'invite' ? tx.inviteMembers
      : activeGroup?.name || '';
  const topSubtitle =
    view === 'group' && activeGroup ? tx.membersCount(activeGroup.members.length)
      : view === 'home' ? tx.tagline
      : '';

  const activeTab: 'home' | 'activity' | 'settings' =
    view === 'activity' ? 'activity' : view === 'settings' ? 'settings' : 'home';
  const showFab = ['home', 'group', 'activity'].includes(view);

  // ============================================================
  // render helpers
  // ============================================================
  const labelStyle = (extra?: CSSProperties): CSSProperties => ({
    display: 'block', fontSize: 13, fontWeight: 650, color: V.dim, ...extra,
  });

  const renderHome = () => (
    <div style={{ animation: 'dc-screenIn .3s ease' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, ...surfaceCard, borderRadius: 20, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: V.dim, fontWeight: 600 }}>{tx.groups}</div>
          <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', marginTop: 6 }}>{groups.length}</div>
        </div>
        <div style={{ flex: 1, ...surfaceCard, borderRadius: 20, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: V.dim, fontWeight: 600 }}>{cap(t.expenses)}</div>
          <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', marginTop: 6, color: V.accent }}>
            {groups.reduce((s, g) => s + g.expenses.length, 0)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 4px 12px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 750, letterSpacing: '-.01em' }}>{tx.groups}</h2>
        <button onClick={openCreate} style={{ fontSize: 13, fontWeight: 700, color: V.accent }}>+ {tx.newGroup}</button>
      </div>
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: V.faint }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{tx.noExpenses}</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{tx.tapPlus}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {groups.map((g) => {
            const total = g.expenses.reduce((s, e) => s + e.amount, 0);
            return (
              <button key={g.id} onClick={() => openGroup(g.id)} style={{ textAlign: 'left', width: '100%', ...surfaceCard, borderRadius: 20, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ flex: 'none', width: 44, height: 44, borderRadius: 14, background: groupCatColor(g.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={groupCatKey(g.category)} size={22} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: V.dim, marginTop: 2 }}>{g.members.length} · {g.expenses.length} {t.expenses}</div>
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div style={{ fontWeight: 800, letterSpacing: '-.02em' }}>{fmt(total, g.currencySymbol)}</div>
                  <div style={{ fontSize: 11, color: V.faint, marginTop: 2 }}>{tx.spent}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGroup = (g: Group, ro: boolean) => {
    const balances = calculateBalances(g);
    const debts = simplifyDebts(balances);
    const total = g.expenses.reduce((s, e) => s + e.amount, 0);
    const expenses = [...g.expenses].sort((a, b) => b.date.getTime() - a.date.getTime());
    return (
      <div style={{ animation: 'dc-screenIn .3s ease' }}>
        <div style={{ ...surfaceCard, borderRadius: 22, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: V.dim, fontWeight: 600 }}>{tx.totalSpent}</div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', marginTop: 5 }}>{fmt(total, g.currencySymbol)}</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${V.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: V.faint }}>{debts.length > 0 ? tx.toSettle(debts.length) : tx.allSettledTitle}</div>
            </div>
            {!ro && (
              <button onClick={() => go('settle')} style={{ padding: '11px 18px', borderRadius: 13, background: V.accent, color: V.accentInk, fontWeight: 700, fontSize: 14 }}>{tx.settleUp}</button>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 750, margin: '16px 4px 10px' }}>{t.balances}</h2>
        <div style={{ ...surfaceCard, borderRadius: 20, overflow: 'hidden' }}>
          {g.members.map((m, i) => {
            const v = balances.find((b) => b.personId === m.id)?.netBalance || 0;
            const settled = Math.abs(v) < 0.01;
            const color2 = settled ? V.faint : v > 0 ? V.pos : V.neg;
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i === g.members.length - 1 ? 'none' : `1px solid ${V.border}` }}>
                <div style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{initials(m.name)}</div>
                <div style={{ flex: 1, fontWeight: 650 }}>{m.name}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 750, color: color2 }}>{fmt(v, g.currencySymbol)}</div>
                  <div style={{ fontSize: 11, color: V.faint }}>{settled ? tx.settled : v > 0 ? tx.getsBack : tx.owes}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 4px 10px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 750 }}>{cap(t.expenses)}</h2>
          <span style={{ fontSize: 12, color: V.faint }}>{expenses.length}</span>
        </div>
        {expenses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {expenses.map((e) => (
              <button key={e.id} disabled={ro} onClick={() => !ro && openEditExpense(g, e.id)} style={{ textAlign: 'left', width: '100%', ...surfaceCard, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, cursor: ro ? 'default' : 'pointer' }}>
                <div style={{ flex: 'none', width: 38, height: 38, borderRadius: 12, background: expCatColor(e.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={expenseCatKey(e.category)} size={19} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 680, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                  <div style={{ fontSize: 12, color: V.dim, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {e.receipt && <Icon name="image" size={12} color={V.faint} />}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.paidByOn(memberName(g, e.paidBy), dateStr(e.date))}{e.recurrence ? ` · ↻ ${e.recurrence.frequency === 'weekly' ? tx.repeatWeekly : tx.repeatMonthly}` : ''}</span>
                  </div>
                  {e.note && <div style={{ fontSize: 12, color: V.faint, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.note}</div>}
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div style={{ fontWeight: 750, letterSpacing: '-.01em' }}>{fmt(e.amount, g.currencySymbol)}</div>
                  {e.originalCurrency && e.originalCurrency !== g.currency && (
                    <div style={{ fontSize: 11, color: V.faint, marginTop: 2 }}>{fmt(e.originalAmount ?? 0, symbolOf(e.originalCurrency))}</div>
                  )}
                </div>
                {!ro && <span style={{ flex: 'none', color: V.faint, fontSize: 18, marginLeft: -2 }}>›</span>}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: V.faint }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{tx.noExpenses}</div>
            {!ro && <div style={{ fontSize: 13, marginTop: 4 }}>{tx.tapPlus}</div>}
          </div>
        )}

        <h2 style={{ fontSize: 15, fontWeight: 750, margin: '20px 4px 10px' }}>{tx.members}</h2>
        <div style={{ ...surfaceCard, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {g.members.slice(0, 5).map((m, i) => (
                <div key={m.id} style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, border: `2.5px solid ${V.surface}`, marginLeft: i === 0 ? 0 : -9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{initials(m.name)}</div>
              ))}
            </div>
            <div style={{ flex: 1, color: V.dim, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.members.map((m) => m.name).join(', ') || '—'}</div>
          </div>
          {!ro && (
            <button onClick={() => { setNewMember(''); setCopied(false); go('invite'); }} style={{ marginTop: 13, width: '100%', padding: 12, borderRadius: 12, background: V.surface2, border: `1px solid ${V.border}`, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>{tx.inviteMembers}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSettle = () => {
    if (!activeGroup) return null;
    const g = activeGroup;
    const debts = simplifyDebts(calculateBalances(g));
    return (
      <div style={{ animation: 'dc-screenIn .3s ease' }}>
        <p style={{ color: V.dim, fontSize: 14, margin: '2px 4px 16px', lineHeight: 1.5 }}>{tx.settleIntro}</p>
        {debts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {debts.map((s, i) => {
              const from = g.members.find((m) => m.id === s.from);
              const to = g.members.find((m) => m.id === s.to);
              return (
                <div key={i} style={{ ...surfaceCard, borderRadius: 18, padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: from?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{initials(from?.name || '')}</div>
                    <div style={{ flex: 1, textAlign: 'center', color: V.dim, fontSize: 13, fontWeight: 650 }}>{from?.name} <span style={{ color: V.accent, fontSize: 16 }}>→</span> {to?.name}</div>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: to?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{initials(to?.name || '')}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 13, borderTop: `1px solid ${V.border}` }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{fmt(s.amount, g.currencySymbol)}</div>
                    <button onClick={() => app.addSettlement({ groupId: g.id, fromPersonId: s.from, toPersonId: s.to, amount: s.amount })} style={{ padding: '10px 16px', borderRadius: 12, background: V.accent, color: V.accentInk, fontWeight: 700, fontSize: 13 }}>{tx.markSettled}</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ width: 70, height: 70, margin: '0 auto', borderRadius: '50%', background: V.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: V.accentInk }}>
              <Icon name="ui_check" size={34} color={V.accentInk} strokeWidth={3} />
            </div>
            <div style={{ fontSize: 19, fontWeight: 750, marginTop: 18 }}>{tx.allSettledTitle}</div>
            <div style={{ fontSize: 14, color: V.dim, marginTop: 6 }}>{tx.allSettledSub}</div>
          </div>
        )}
      </div>
    );
  };

  const renderInvite = () => {
    if (!activeGroup) return null;
    const g = activeGroup;
    const url = shareUrlFor(g);
    return (
      <div style={{ animation: 'dc-screenIn .3s ease' }}>
        <p style={{ color: V.dim, fontSize: 14, margin: '2px 4px 16px', lineHeight: 1.5 }}>{tx.inviteIntro}</p>
        <label style={{ ...labelStyle({ margin: '0 2px 8px' }) }}>{tx.shareLink}</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', ...surfaceCard, borderRadius: 14, padding: '6px 6px 6px 15px' }}>
          <div style={{ flex: 1, fontSize: 13, color: V.dim, fontFamily: 'ui-monospace,monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</div>
          <button onClick={() => copyLink(url)} aria-label={tx.a11yCopyLink} style={{ padding: '9px 15px', borderRadius: 10, background: V.surface2, border: `1px solid ${V.border}`, fontWeight: 700, fontSize: 13, color: copied ? V.accent : V.text }}>{copied ? tx.copied : tx.copy}</button>
        </div>
        <div style={{ fontSize: 12.5, color: V.faint, margin: '8px 4px 0', lineHeight: 1.5 }}>{tx.inviteHint}</div>

        <label style={{ ...labelStyle({ margin: '22px 2px 8px' }) }}>{tx.membersCount(g.members.length)}</label>
        <div style={{ ...surfaceCard, borderRadius: 16, overflow: 'hidden' }}>
          {g.members.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderBottom: `1px solid ${V.border}` }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{initials(m.name)}</div>
              <input value={m.name} onChange={(e) => app.updatePerson(g.id, m.id, { name: e.target.value })} aria-label={`${tx.members} — ${m.name}`} style={{ flex: 1, fontWeight: 650 }} />
              <button onClick={() => requestRemoveMember(g, m.id)} aria-label={`${tx.a11yRemoveMember} — ${m.name}`} style={{ color: V.faint, fontSize: 18, padding: '2px 6px' }}><span aria-hidden="true">×</span></button>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px' }}>
            <input value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder={tx.addMemberPlaceholder} aria-label={tx.addMemberPlaceholder} style={{ flex: 1, fontWeight: 600 }} />
            <button onClick={() => { const n = newMember.trim(); if (n) { app.addPerson(g.id, n); setNewMember(''); } }} style={{ padding: '7px 13px', borderRadius: 10, background: V.surface2, border: `1px solid ${V.border}`, fontWeight: 700, fontSize: 13 }}>{tx.add}</button>
          </div>
        </div>
        <button onClick={back} style={{ ...primaryBtn, marginTop: 26, boxShadow: '0 8px 22px rgba(31,182,171,.3)' }}>{tx.done}</button>
      </div>
    );
  };

  const renderActivity = () => {
    const all = groups.flatMap((g) => g.expenses.map((e) => ({ e, g }))).sort((a, b) => b.e.date.getTime() - a.e.date.getTime()).slice(0, 20);
    if (all.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '56px 20px', color: V.faint, animation: 'dc-screenIn .3s ease' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{tx.noExpenses}</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{tx.tapPlus}</div>
        </div>
      );
    }
    return (
      <div style={{ animation: 'dc-screenIn .3s ease', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {all.map(({ e, g }) => (
          <div key={e.id} style={{ ...surfaceCard, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 'none', width: 38, height: 38, borderRadius: 12, background: expCatColor(e.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={expenseCatKey(e.category)} size={19} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 680, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
              <div style={{ fontSize: 12, color: V.dim, marginTop: 2 }}>{g.name} · {memberName(g, e.paidBy)}</div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontWeight: 750, letterSpacing: '-.01em' }}>{fmt(e.amount, g.currencySymbol)}</div>
              <div style={{ fontSize: 11, color: V.faint, marginTop: 2 }}>{dateStr(e.date)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => {
    const secTitle: CSSProperties = { fontSize: 12, fontWeight: 700, color: V.dim, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 4px 8px' };
    const segRow: CSSProperties = { display: 'flex', gap: 6, ...surfaceCard, borderRadius: 15, padding: 5 };
    return (
      <div style={{ animation: 'dc-screenIn .3s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={secTitle}>{tx.language}</div>
          <div style={segRow}>
            {(['en', 'ja', 'zh'] as const).map((l) => (
              <button key={l} onClick={() => setLanguage(l)} style={segStyle(language === l)}>{LANG_LABEL[l]}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={secTitle}>{tx.appearance}</div>
          <div style={segRow}>
            <button onClick={() => ui.setTheme('light')} style={segStyle(theme === 'light')}>{tx.light}</button>
            <button onClick={() => ui.setTheme('dark')} style={segStyle(theme === 'dark')}>{tx.dark}</button>
          </div>
        </div>
        <div>
          <div style={secTitle}>{tx.glassStyle}</div>
          <div style={segRow}>
            <button onClick={() => ui.setGlass('frost')} style={segStyle(glass === 'frost')}>{tx.frost}</button>
            <button onClick={() => ui.setGlass('clear')} style={segStyle(glass === 'clear')}>{tx.clear}</button>
          </div>
          <div style={{ fontSize: 12.5, color: V.faint, margin: '8px 4px 0', lineHeight: 1.5 }}>{glass === 'frost' ? tx.glassDescFrost : tx.glassDescClear}</div>
        </div>
        <div>
          <div style={secTitle}>{tx.data}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([[tx.exportBackup, '↓', exportBackup], [tx.exportCsv, '↓', exportCsv], [tx.importBackup, '↑', () => fileInputRef.current?.click()]] as const).map(([lbl, glyph, fn], i) => (
              <button key={i} onClick={fn} style={{ textAlign: 'left', ...surfaceCard, borderRadius: 14, padding: '14px 16px', fontWeight: 650, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{lbl}</span><span style={{ color: V.faint, fontSize: 17 }}>{glyph}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: V.faint, margin: '8px 4px 0', lineHeight: 1.5 }}>{tx.dataPrivacyNote}</div>
        </div>
        <button onClick={ui.replayOnboarding} style={{ textAlign: 'left', ...surfaceCard, borderRadius: 16, padding: '15px 16px', fontWeight: 650, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{tx.replayOnboarding}</span><span style={{ color: V.faint }}>›</span>
        </button>
        <div style={{ textAlign: 'center', color: V.faint, fontSize: 12, padding: 4 }}>SplitAA · splitaa.app · v2.0</div>
      </div>
    );
  };

  const renderCreate = () => {
    return (
      <div style={{ animation: 'dc-screenIn .3s ease' }}>
        <label style={{ ...labelStyle({ margin: '0 2px 8px' }) }}>{tx.groupName}</label>
        <input value={cgName} onChange={(e) => setCgName(e.target.value)} placeholder={tx.groupNamePlaceholder} aria-label={tx.groupName} style={{ width: '100%', padding: 15, borderRadius: 14, ...surfaceCard, fontWeight: 650 }} />

        <label style={{ ...labelStyle({ margin: '20px 2px 8px' }) }}>{tx.category}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GROUP_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCgCat(c.id)} style={chipStyle(cgCat === c.id)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 7 }}>
                <Icon name={groupCatKey(c.id)} size={16} color={cgCat === c.id ? V.accentInk : c.color} />
              </span>
              {c.name}
            </button>
          ))}
        </div>

        <label style={{ ...labelStyle({ margin: '20px 2px 8px' }) }}>{tx.currency}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => setCgCur(c.code)} style={chipStyle(cgCur === c.code)}>{c.code} {c.symbol}</button>
          ))}
        </div>

        {!cgEditId && (
          <>
            <label style={{ ...labelStyle({ margin: '20px 2px 8px' }) }}>{tx.members}</label>
            <div style={{ ...surfaceCard, borderRadius: 16, overflow: 'hidden' }}>
              {cgMembers.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderBottom: `1px solid ${V.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{initials(m.name)}</div>
                  <input value={m.name} onChange={(e) => setCgMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))} aria-label={`${tx.members} — ${m.name}`} style={{ flex: 1, fontWeight: 650 }} />
                  <button onClick={() => setCgMembers((prev) => prev.filter((x) => x.id !== m.id))} aria-label={`${tx.a11yRemoveMember} — ${m.name}`} style={{ color: V.faint, fontSize: 18, padding: '2px 6px' }}><span aria-hidden="true">×</span></button>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px' }}>
                <input value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder={tx.addMemberPlaceholder} aria-label={tx.addMemberPlaceholder} style={{ flex: 1, fontWeight: 600 }} />
                <button onClick={addLocalMember} style={{ padding: '7px 13px', borderRadius: 10, background: V.surface2, border: `1px solid ${V.border}`, fontWeight: 700, fontSize: 13 }}>{tx.add}</button>
              </div>
            </div>
          </>
        )}

        <button onClick={createGroupSubmit} style={{ ...primaryBtn, marginTop: 26, opacity: cgName.trim() ? 1 : 0.5, boxShadow: '0 8px 22px rgba(31,182,171,.3)' }}>{cgEditId ? tx.saveChanges : tx.createGroup}</button>
        {cgEditId && (
          <button onClick={requestDeleteGroup} style={{ marginTop: 10, width: '100%', padding: 14, borderRadius: 16, background: 'transparent', border: `1px solid ${V.border}`, color: V.neg, fontWeight: 700, fontSize: 15 }}>{tx.deleteGroup}</button>
        )}
      </div>
    );
  };

  const content = () => {
    if (view === 'home') return renderHome();
    if (view === 'group') return activeGroup ? renderGroup(activeGroup, !!readOnly) : null;
    if (view === 'settle') return renderSettle();
    if (view === 'invite') return renderInvite();
    if (view === 'activity') return renderActivity();
    if (view === 'settings') return renderSettings();
    if (view === 'create') return renderCreate();
    return null;
  };

  // ============================================================
  // Read-only snapshot: minimal shell, no tabs / FAB / actions
  // ============================================================
  if (readOnly) {
    return (
      <Shell theme={theme} glass={glass}>
        <TopBar
          showBack={false} showLogo title={readOnlyGroup?.name || 'SplitAA'} subtitle={tx.tagline}
          showMenu={false} themeGlyph={theme === 'light' ? '☾' : '☀'}
          backLabel={tx.a11yBack} menuLabel={tx.a11yMenu} themeLabel={tx.a11yToggleTheme}
          onBack={() => {}} onMenu={() => {}} onTheme={toggleTheme}
        />
        <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '18px 18px 40px' }}>
          {readOnlyGroup ? renderGroup(readOnlyGroup, true) : <div style={{ padding: 40, textAlign: 'center', color: V.faint }}>…</div>}
        </div>
      </Shell>
    );
  }

  // ============================================================
  // Main app
  // ============================================================
  return (
    <Shell theme={theme} glass={glass}>
      <TopBar
        showBack={showBack} showLogo={showLogo} title={topTitle} subtitle={topSubtitle}
        showMenu={view === 'group'} themeGlyph={theme === 'light' ? '☾' : '☀'}
        backLabel={tx.a11yBack} menuLabel={tx.a11yMenu} themeLabel={tx.a11yToggleTheme}
        onBack={back} onMenu={() => setGroupMenuOpen(true)} onTheme={toggleTheme}
      />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '18px 18px 172px' }}>
        {content()}
      </div>

      {showFab && (
        <button onClick={openAdd} aria-label={tx.addExpense} style={{ position: 'absolute', right: 18, bottom: 108, zIndex: 8, width: 60, height: 60, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: V.accent, color: V.accentInk, boxShadow: '0 12px 30px rgba(31,182,171,.42),inset 0 1px 0 rgba(255,255,255,.4)', animation: 'dc-fabPop .3s ease' }}>
          <Icon name="plus" size={28} color={V.accentInk} strokeWidth={2.5} />
        </button>
      )}

      {/* tab bar */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, zIndex: 7, display: 'flex', padding: 7, borderRadius: 24, ...glassPanel }}>
        {([['home', tx.groups, 'ui_groups'], ['activity', tx.activity, 'ui_activity'], ['settings', tx.settings, 'ui_settings']] as const).map(([k, lbl, icon]) => {
          const active = activeTab === k;
          return (
            <button key={k} onClick={() => go(k as View)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 17, background: active ? V.surface2 : 'transparent' }}>
              <div style={{ height: 21, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={21} color={active ? V.accent : V.faint} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: active ? V.accent : V.faint }}>{lbl}</span>
            </button>
          );
        })}
      </div>

      <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={onImportFile} style={{ display: 'none' }} />

      {addOpen && draft && expenseSheet()}
      {groupMenuOpen && groupMenu()}
      {confirm && confirmDialog()}
    </Shell>
  );

  // ============================================================
  // Overlays (declared as closures so they share state)
  // ============================================================
  function expenseSheet() {
    if (!draft) return null;
    const g = groups.find((x) => x.id === draft.groupId);
    const symbol = g ? g.currencySymbol : '$'; // group currency (splits/balances)
    const entrySymbol = symbolOf(draft.currency); // currency the amount is typed in
    const foreign = !!g && draft.currency !== g.currency;
    const eligible = g && g.members.length >= 2;
    const total = draftTotal(); // entered amount converted to group currency
    const members = g ? g.members : [];
    const eq = members.length ? total / members.length : 0;
    const mode = draft.splitType;
    const rawSum = members.reduce((s, m) => s + (parseFloat(draft.shares[m.id]) || 0), 0);
    const remainderAmt = total - rawSum; // custom
    const remainderPct = 100 - rawSum; // percentage
    const adjBase = members.length ? (total - rawSum) / members.length : 0; // adjustment: equal base after adjustments
    const computedFor = (id: string) => {
      const raw = parseFloat(draft.shares[id]) || 0;
      if (mode === 'equal') return eq;
      if (mode === 'custom') return raw;
      if (mode === 'percentage') return (total * raw) / 100;
      if (mode === 'adjustment') return adjBase + raw;
      return rawSum > 0 ? (total * raw) / rawSum : 0; // shares
    };
    const amountWidth = `${Math.max(1, (draft.amount || '0').length)}ch`;
    const saveOk =
      total > 0 && eligible &&
      (mode === 'equal' ? true
        : mode === 'custom' ? Math.abs(remainderAmt) < 0.01
        : mode === 'percentage' ? Math.abs(remainderPct) < 0.01
        : mode === 'adjustment' ? true
        : rawSum > 0);

    return (
      <>
        <div onClick={closeAdd} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(6,8,14,.42)', animation: 'dc-scrimIn .25s ease' }} />
        <div role="dialog" aria-modal="true" aria-label={draft.id ? tx.editExpense : tx.addExpense} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 21, maxHeight: '92%', display: 'flex', flexDirection: 'column', borderRadius: '28px 28px 0 0', background: V.glassBg, WebkitBackdropFilter: 'blur(30px) saturate(180%)', backdropFilter: 'blur(30px) saturate(180%)', border: `1px solid ${V.glassBorder}`, borderBottom: 'none', boxShadow: `0 -16px 50px rgba(0,0,0,.3), inset 0 1px 0 ${V.glassHi}`, animation: 'dc-sheetIn .32s cubic-bezier(.32,.72,0,1)' }}>
          <div style={{ flex: 'none', padding: '12px 20px 6px' }}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: V.faint, opacity: 0.5, margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={closeAdd} style={{ fontSize: 15, fontWeight: 600, color: V.dim }}>{tx.cancel}</button>
              <div style={{ fontWeight: 750, fontSize: 16 }}>{draft.id ? tx.editExpense : tx.addExpense}</div>
              <button onClick={saveExpense} style={{ fontSize: 15, fontWeight: 750, color: V.accent, opacity: saveOk ? 1 : 0.45 }}>{tx.save}</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 26px' }}>
            <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
              <div>
                <select value={draft.currency} onChange={(e) => setDraftCurrency(e.target.value)} aria-label={tx.a11yCurrency} style={{ appearance: 'none', WebkitAppearance: 'none', background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 999, padding: '5px 14px', fontSize: 12.5, fontWeight: 700, color: V.text, marginBottom: 8, textAlign: 'center' }}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.symbol}</option>)}
                </select>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 600, color: V.dim }}>{entrySymbol}</span>
                <input value={draft.amount} onChange={(e) => patchDraft({ amount: e.target.value.replace(/[^0-9.]/g, '') })} inputMode="decimal" placeholder="0" aria-label={tx.addExpense} style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', width: amountWidth, maxWidth: 230, textAlign: 'center' }} />
              </div>
              {foreign && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13 }}>
                  <span style={{ color: V.dim, fontWeight: 600 }}>{tx.exchangeRate}</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 10, padding: '5px 10px' }}>
                    <input value={draft.fxRate} onChange={(e) => patchDraft({ fxRate: e.target.value.replace(/[^0-9.]/g, '') })} inputMode="decimal" aria-label={tx.exchangeRate} style={{ width: 72, textAlign: 'right', fontWeight: 700, fontSize: 13 }} />
                  </div>
                  <span style={{ color: V.faint }}>→</span>
                  <span style={{ fontWeight: 750 }}>{fmt(total, symbol)}</span>
                </div>
              )}
            </div>
            <input value={draft.desc} onChange={(e) => patchDraft({ desc: e.target.value })} placeholder={tx.descPlaceholder} aria-label={tx.descPlaceholder} style={{ width: '100%', textAlign: 'center', fontSize: 16, fontWeight: 600, padding: 10, color: V.text }} />

            <textarea value={draft.note} onChange={(e) => patchDraft({ note: e.target.value })} placeholder={tx.notePlaceholder} aria-label={tx.notePlaceholder} rows={2} style={{ width: '100%', marginTop: 6, resize: 'none', ...surfaceCard, borderRadius: 12, padding: '10px 12px', fontSize: 14, fontWeight: 500, lineHeight: 1.45, color: V.text }} />

            <input ref={receiptInputRef} type="file" accept="image/*" onChange={onReceiptFile} style={{ display: 'none' }} />
            <div style={{ marginTop: 8 }}>
              {draft.receipt ? (
                <div style={{ position: 'relative', width: 'fit-content' }}>
                  <a href={draft.receipt} target="_blank" rel="noreferrer" aria-label={tx.a11yViewReceipt}>
                    <img src={draft.receipt} alt="" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 12, border: `1px solid ${V.border}`, display: 'block' }} />
                  </a>
                  <button onClick={() => patchDraft({ receipt: '' })} aria-label={tx.a11yRemoveReceipt} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 999, background: V.neg, color: '#fff', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: V.glassShadow }}><span aria-hidden="true">×</span></button>
                </div>
              ) : (
                <button onClick={() => receiptInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 12, background: V.surface2, border: `1px solid ${V.border}`, fontSize: 13, fontWeight: 700, color: V.text }}>
                  <Icon name="image" size={16} color={V.dim} />{tx.addReceipt}
                </button>
              )}
            </div>

            {!draft.locked && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, margin: '18px 2px 8px' }}>{tx.group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {groups.filter((x) => x.members.length >= 2).map((x) => (
                    <button key={x.id} onClick={() => patchDraft({ groupId: x.id, paidBy: x.members[0]?.id || '', shares: {}, currency: x.currency, fxRate: '1' })} style={chipStyle(x.id === draft.groupId)}>{x.name}</button>
                  ))}
                </div>
              </>
            )}

            {!eligible ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: V.faint, fontSize: 14, fontWeight: 600 }}>{tx.needTwoMembers}</div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, margin: '18px 2px 8px' }}>{tx.category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => patchDraft({ category: c.id })} style={chipStyle(draft.category === c.id)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 7 }}>
                        <Icon name={expenseCatKey(c.id)} size={16} color={draft.category === c.id ? V.accentInk : c.color} />
                      </span>{c.name}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, margin: '18px 2px 8px' }}>{tx.whoPaid}</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', overflowY: 'visible', padding: '8px 6px' }}>
                  {g!.members.map((m) => {
                    const sel = draft.paidBy === m.id;
                    return (
                      <button key={m.id} onClick={() => patchDraft({ paidBy: m.id })} style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 56 }}>
                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: sel ? `0 0 0 3px ${V.bg}, 0 0 0 5px ${V.accent}` : 'none' }}>{initials(m.name)}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: sel ? V.accent : V.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 56 }}>{m.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, margin: '20px 2px 8px' }}>{tx.splitBetween}</div>
                <div style={{ display: 'flex', gap: 4, background: V.surface3, borderRadius: 11, padding: 4, marginBottom: 10 }}>
                  {(['equal', 'custom', 'percentage', 'shares', 'adjustment'] as const).map((k) => {
                    const active = mode === k;
                    const lbl = k === 'equal' ? tx.equal : k === 'custom' ? tx.custom : k === 'percentage' ? tx.splitPercent : k === 'shares' ? tx.splitShares : tx.splitAdjust;
                    return <button key={k} onClick={() => setMode(k)} style={{ flex: 1, padding: '7px 2px', borderRadius: 8, textAlign: 'center', background: active ? V.accent : 'transparent', color: active ? V.accentInk : V.dim, fontWeight: active ? 700 : 650, fontSize: 11.5 }}>{lbl}</button>;
                  })}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, color: V.faint, fontWeight: 600 }}>{tx.templates}</span>
                  {(g!.splitTemplates || []).map((t) => (
                    <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 999, padding: '4px 4px 4px 11px', fontSize: 12.5, fontWeight: 650 }}>
                      <button onClick={() => applyTemplate(t)} style={{ color: V.text }}>{t.name}</button>
                      <button onClick={() => app.deleteSplitTemplate(g!.id, t.id)} aria-label={`${tx.a11yDeleteTemplate} — ${t.name}`} style={{ color: V.faint, fontSize: 15, lineHeight: 1, padding: '0 3px' }}><span aria-hidden="true">×</span></button>
                    </span>
                  ))}
                  {tplSaving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 999, padding: '4px 5px 4px 11px' }}>
                      <input value={tplName} onChange={(e) => setTplName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveTemplate()} placeholder={tx.templateNamePlaceholder} aria-label={tx.templateNamePlaceholder} autoFocus style={{ width: 108, fontSize: 12.5, fontWeight: 600 }} />
                      <button onClick={saveTemplate} style={{ padding: '4px 11px', borderRadius: 999, background: V.accent, color: V.accentInk, fontWeight: 700, fontSize: 12 }}>{tx.save}</button>
                    </span>
                  ) : (
                    <button onClick={() => { setTplName(''); setTplSaving(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: `1px dashed ${V.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, color: V.accent }}>
                      <Icon name="plus" size={13} color={V.accent} strokeWidth={2.5} />{tx.saveTemplate}
                    </button>
                  )}
                </div>

                <div style={{ ...surfaceCard, borderRadius: 16, overflow: 'hidden' }}>
                  {members.map((m) => {
                    const showFill = (mode === 'custom' && remainderAmt > 0.005) || (mode === 'percentage' && remainderPct > 0.005);
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', borderBottom: `1px solid ${V.border}` }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{initials(m.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                          {(mode === 'percentage' || mode === 'shares' || mode === 'adjustment') && <div style={{ fontSize: 11.5, color: V.faint, marginTop: 1 }}>{fmt(computedFor(m.id), symbol)}</div>}
                        </div>
                        {mode === 'equal' && <div style={{ fontWeight: 700, fontSize: 14, color: V.dim }}>{fmt(eq, symbol)}</div>}
                        {mode !== 'equal' && (
                          <>
                            {showFill && (
                              <button onClick={() => fillRemainingShare(m.id)} aria-label={`${tx.a11yAssignRemaining} — ${m.name}`} style={{ flex: 'none', width: 28, height: 28, borderRadius: 9, background: 'rgba(31,182,171,.14)', border: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="plus" size={14} color={V.accent} strokeWidth={2.5} />
                              </button>
                            )}
                            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 3, background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 10, padding: '6px 10px' }}>
                              {(mode === 'custom' || mode === 'adjustment') && <span style={{ fontSize: 13, color: V.dim }}>{symbol}</span>}
                              <input value={draft.shares[m.id] ?? ''} onChange={(e) => setDraftShare(m.id, e.target.value)} inputMode={mode === 'adjustment' ? 'text' : 'decimal'} aria-label={`${tx.splitBetween} — ${m.name}`} style={{ width: mode === 'custom' || mode === 'adjustment' ? 60 : 48, textAlign: 'right', fontWeight: 700, fontSize: 14 }} />
                              {mode === 'percentage' && <span style={{ fontSize: 13, color: V.dim }}>%</span>}
                              {mode === 'shares' && <span style={{ fontSize: 13, color: V.dim }}>×</span>}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {(mode === 'custom' || mode === 'percentage') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 15px', fontSize: 13, fontWeight: 700, color: Math.abs(mode === 'custom' ? remainderAmt : remainderPct) < 0.01 ? V.pos : V.neg }}>
                      <span>{tx.remaining}</span><span>{mode === 'custom' ? fmt(remainderAmt, symbol) : `${pctStr(remainderPct)}%`}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: V.dim }}>{tx.repeat}</span>
                  <div style={{ display: 'flex', gap: 5, background: V.surface3, borderRadius: 11, padding: 4 }}>
                    {(['none', 'weekly', 'monthly'] as const).map((k) => (
                      <button key={k} onClick={() => patchDraft({ repeat: k })} style={draft.repeat === k ? { padding: '7px 12px', borderRadius: 9, background: V.accent, color: V.accentInk, fontWeight: 700, fontSize: 13 } : { padding: '7px 12px', borderRadius: 9, color: V.dim, fontWeight: 650, fontSize: 13 }}>{k === 'none' ? tx.repeatNone : k === 'weekly' ? tx.repeatWeekly : tx.repeatMonthly}</button>
                    ))}
                  </div>
                </div>

                <button onClick={saveExpense} style={{ ...primaryBtn, marginTop: 22, fontWeight: 750, opacity: saveOk ? 1 : 0.45 }}>{draft.id ? tx.saveChanges : tx.addExpense}</button>
                {draft.id && (
                  <button onClick={requestDeleteExpense} style={{ marginTop: 10, width: '100%', padding: 14, borderRadius: 16, background: 'transparent', border: `1px solid ${V.border}`, color: V.neg, fontWeight: 700, fontSize: 15 }}>{tx.deleteExpense}</button>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  function groupMenu() {
    return (
      <>
        <div onClick={() => setGroupMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 22, background: 'rgba(6,8,14,.42)', animation: 'dc-scrimIn .25s ease' }} />
        <div role="dialog" aria-modal="true" aria-label={tx.a11yMenu} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 23, padding: '8px 14px 20px', borderRadius: '28px 28px 0 0', background: V.glassBg, WebkitBackdropFilter: 'blur(30px) saturate(180%)', backdropFilter: 'blur(30px) saturate(180%)', border: `1px solid ${V.glassBorder}`, borderBottom: 'none', boxShadow: `0 -16px 50px rgba(0,0,0,.3), inset 0 1px 0 ${V.glassHi}`, animation: 'dc-sheetIn .3s cubic-bezier(.32,.72,0,1)' }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: V.faint, opacity: 0.5, margin: '6px auto 12px' }} />
          <button onClick={openEditGroup} style={{ width: '100%', textAlign: 'left', padding: '15px 14px', borderRadius: 14, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 12, background: 'transparent' }}>
            <span style={{ display: 'inline-flex', color: V.text }}><Icon name="ui_edit" size={18} /></span>{tx.editGroup}
          </button>
          <button onClick={requestDeleteGroup} style={{ width: '100%', textAlign: 'left', padding: '15px 14px', borderRadius: 14, fontWeight: 650, color: V.neg, display: 'flex', alignItems: 'center', gap: 12, background: 'transparent' }}>
            <span style={{ display: 'inline-flex' }}><Icon name="ui_trash" size={18} color={V.neg} /></span>{tx.deleteGroup}
          </button>
          <button onClick={() => setGroupMenuOpen(false)} style={{ width: '100%', padding: 15, marginTop: 6, borderRadius: 14, background: V.surface2, border: `1px solid ${V.border}`, fontWeight: 700 }}>{tx.cancel}</button>
        </div>
      </>
    );
  }

  function confirmDialog() {
    if (!confirm) return null;
    const c = confirm;
    return (
      <div onClick={() => setConfirm(null)} style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, background: 'rgba(6,8,14,.5)', animation: 'dc-scrimIn .2s ease' }}>
        <div role="alertdialog" aria-modal="true" aria-label={c.title} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 340, borderRadius: 24, padding: '24px 22px 18px', background: V.glassBg, WebkitBackdropFilter: 'blur(30px) saturate(180%)', backdropFilter: 'blur(30px) saturate(180%)', border: `1px solid ${V.glassBorder}`, boxShadow: `${V.glassShadow}, inset 0 1px 0 ${V.glassHi}`, animation: 'dc-sheetIn .28s cubic-bezier(.32,.72,0,1)' }}>
          {c.danger && (
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(224,100,74,.16)', color: V.neg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="ui_warn" size={24} color={V.neg} />
            </div>
          )}
          <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>{c.title}</h3>
          <p style={{ textAlign: 'center', color: V.dim, fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>{c.message}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {c.showCancel !== false && (
              <button onClick={() => setConfirm(null)} style={{ flex: 1, padding: 14, borderRadius: 14, background: V.surface2, border: `1px solid ${V.border}`, fontWeight: 700 }}>{c.cancelLabel || tx.cancel}</button>
            )}
            <button onClick={() => { const cb = c.onConfirm; setConfirm(null); cb?.(); }} style={{ flex: 1, padding: 14, borderRadius: 14, fontWeight: 750, background: c.danger ? V.neg : V.accent, color: c.danger ? '#fff' : V.accentInk }}>{c.confirmLabel}</button>
          </div>
        </div>
      </div>
    );
  }
}

// ============================================================
// Phone-frame shell + top bar (module scope, pure presentational)
// ============================================================
function Shell({ theme, glass, children }: { theme: string; glass: string; children: React.ReactNode }) {
  const cls = `dc-app${theme === 'dark' ? ' theme-dark' : ''}${glass === 'clear' ? ' glass-clear' : ''}`;
  return (
    <div className={cls} style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'stretch', background: 'var(--frame-bg)', color: V.text }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 432, height: '100dvh', maxHeight: 940, overflow: 'hidden', background: V.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', inset: 0, background: V.ambient, pointerEvents: 'none', zIndex: 0 }} />
        {children}
      </div>
    </div>
  );
}

interface TopBarProps {
  showBack: boolean; showLogo: boolean; title: string; subtitle?: string; showMenu: boolean;
  themeGlyph: string;
  backLabel: string; menuLabel: string; themeLabel: string;
  onBack: () => void; onMenu: () => void; onTheme: () => void;
}
function TopBar({ showBack, showLogo, title, subtitle, showMenu, themeGlyph, backLabel, menuLabel, themeLabel, onBack, onMenu, onTheme }: TopBarProps) {
  const pill: CSSProperties = { width: 34, height: 34, borderRadius: 999, background: V.surface2, border: `1px solid ${V.border}`, fontSize: 14 };
  return (
    <header style={{ position: 'relative', zIndex: 5, flex: 'none', padding: '14px 18px 12px', display: 'flex', alignItems: 'center', gap: 12, background: V.glassBg, WebkitBackdropFilter: backdrop, backdropFilter: backdrop, borderBottom: `1px solid ${V.glassBorder}`, boxShadow: `inset 0 1px 0 ${V.glassHi}` }}>
      {showBack && <button onClick={onBack} aria-label={backLabel} style={{ width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: V.text, marginLeft: -6 }}><span aria-hidden="true">‹</span></button>}
      {showLogo && <img src="/splitaa-logo.svg" alt="SplitAA" width={34} height={34} style={{ display: 'block', flex: 'none' }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 750, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
        {subtitle ? <div style={{ fontSize: 12, color: V.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div> : null}
      </div>
      {showMenu && <button onClick={onMenu} aria-label={menuLabel} style={{ width: 34, height: 34, borderRadius: 999, background: V.surface2, border: `1px solid ${V.border}`, fontSize: 19, fontWeight: 800, lineHeight: 1, letterSpacing: 1 }}><span aria-hidden="true">⋯</span></button>}
      <button onClick={onTheme} aria-label={themeLabel} style={pill}><span aria-hidden="true">{themeGlyph}</span></button>
    </header>
  );
}
