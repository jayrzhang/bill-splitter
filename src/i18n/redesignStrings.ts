import type { Language } from './translations';

/**
 * Strings specific to the Liquid Glass redesign (onboarding, settle-up,
 * activity, settings, invite, bottom-sheets). Translations taken from the
 * design handoff so the new UI is fully localized in en / ja / zh.
 * Shared strings (members, expenses, balances, currency, cancel, save, …)
 * continue to come from the existing `translations` file via `t`.
 */
export interface RedesignStrings {
  groups: string;
  activity: string;
  settings: string;
  tagline: string;

  // onboarding
  welcomeTitle: string;
  welcomeSub: string;
  getStarted: string;
  continue: string;
  skip: string;
  setupTitle: string;
  setupSub: string;
  defaultCurrency: string;

  // home / group
  totalSpent: string;
  spent: string;
  settleUp: string;
  toSettle: (n: number) => string;
  noExpenses: string;
  tapPlus: string;
  paidByOn: (payer: string, date: string) => string;

  // balances
  owes: string;
  getsBack: string;
  settled: string;

  // settle
  settleIntro: string;
  markSettled: string;
  allSettledTitle: string;
  allSettledSub: string;

  // invite
  inviteMembers: string;
  inviteIntro: string;
  inviteHint: string;
  shareLink: string;
  copy: string;
  copied: string;
  membersCount: (n: number) => string;
  add: string;
  addMemberPlaceholder: string;
  you: string;
  done: string;

  // create / edit group
  newGroup: string;
  createGroup: string;
  editGroup: string;
  groupName: string;
  groupNamePlaceholder: string;
  category: string;
  currency: string;
  members: string;
  saveChanges: string;
  deleteGroup: string;

  // expense sheet
  addExpense: string;
  editExpense: string;
  descPlaceholder: string;
  notePlaceholder: string;
  group: string;
  whoPaid: string;
  splitBetween: string;
  equal: string;
  custom: string;
  splitPercent: string;
  splitShares: string;
  remaining: string;
  save: string;
  cancel: string;
  deleteExpense: string;
  needTwoMembers: string;
  repeat: string;
  repeatNone: string;
  repeatWeekly: string;
  repeatMonthly: string;

  // settings
  appearance: string;
  light: string;
  dark: string;
  glassStyle: string;
  frost: string;
  clear: string;
  glassDescFrost: string;
  glassDescClear: string;
  language: string;
  replayOnboarding: string;

  // data ownership
  data: string;
  exportBackup: string;
  exportCsv: string;
  importBackup: string;
  dataPrivacyNote: string;
  importedTitle: string;
  importedMsg: (n: number) => string;
  importFailedTitle: string;
  nothingToExport: string;

  // confirm dialogs
  ok: string;
  remove: string;
  deleteGroupTitle: string;
  deleteGroupMsg: (name: string) => string;
  deleteGroupUnsettled: (name: string) => string;
  deleteExpenseTitle: string;
  deleteExpenseMsg: string;
  removeMemberTitle: string;
  removeMemberMsg: (name: string) => string;
  cantRemoveTitle: string;
  cantRemoveMsg: (name: string) => string;
}

export const redesignStrings: Record<Language, RedesignStrings> = {
  en: {
    groups: 'Groups',
    activity: 'Activity',
    settings: 'Settings',
    tagline: 'Split bills, beautifully',
    welcomeTitle: 'Split bills, beautifully.',
    welcomeSub: 'Track shared expenses across trips, homes and nights out — settle up in a tap.',
    getStarted: 'Get started',
    continue: 'Continue',
    skip: 'Skip for now',
    setupTitle: 'Pick your currency',
    setupSub: 'Used as the default when you create a new group.',
    defaultCurrency: 'Default currency',
    totalSpent: 'Total spent',
    spent: 'spent',
    settleUp: 'Settle up',
    toSettle: (n) => (n === 1 ? '1 transfer to settle' : `${n} transfers to settle`),
    noExpenses: 'No expenses yet',
    tapPlus: 'Tap + to add the first one',
    paidByOn: (p, d) => `Paid by ${p} · ${d}`,
    owes: 'owes',
    getsBack: 'gets back',
    settled: 'settled',
    settleIntro: 'The simplest way for everyone to get square. Fewest transfers, no back-and-forth.',
    markSettled: 'Mark settled',
    allSettledTitle: 'All settled up',
    allSettledSub: 'Everyone in this group is even.',
    inviteMembers: 'Invite members',
    inviteIntro: 'Anyone with the link can view this group as a read-only snapshot.',
    inviteHint: 'The link works on any device — no account needed.',
    shareLink: 'Share link',
    copy: 'Copy',
    copied: 'Copied',
    membersCount: (n) => `Members · ${n}`,
    add: 'Add',
    addMemberPlaceholder: 'Add a friend by name',
    you: 'You',
    done: 'Done',
    newGroup: 'New group',
    createGroup: 'Create group',
    editGroup: 'Edit group',
    groupName: 'Group name',
    groupNamePlaceholder: 'e.g. Summer trip',
    category: 'Category',
    currency: 'Currency',
    members: 'Members',
    saveChanges: 'Save changes',
    deleteGroup: 'Delete group',
    addExpense: 'Add expense',
    editExpense: 'Edit expense',
    descPlaceholder: 'What was it for?',
    notePlaceholder: 'Add a note (optional)',
    group: 'Group',
    whoPaid: 'Who paid',
    splitBetween: 'Split between',
    equal: 'Equal',
    custom: 'Custom',
    splitPercent: '%',
    splitShares: 'Shares',
    remaining: 'Remaining',
    save: 'Save',
    cancel: 'Cancel',
    deleteExpense: 'Delete expense',
    needTwoMembers: 'Add at least 2 members to this group first.',
    repeat: 'Repeat',
    repeatNone: 'None',
    repeatWeekly: 'Weekly',
    repeatMonthly: 'Monthly',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    glassStyle: 'Glass style',
    frost: 'Frost',
    clear: 'Clear',
    glassDescFrost: 'Softer, more opaque frosted panels. Calm and highly legible.',
    glassDescClear: 'Thin, highly translucent glass with crisp specular edges. More liquid, more depth.',
    language: 'Language',
    replayOnboarding: 'Replay onboarding',
    data: 'Data',
    exportBackup: 'Export backup (JSON)',
    exportCsv: 'Export expenses (CSV)',
    importBackup: 'Import backup',
    dataPrivacyNote: 'Your data lives only on this device. Back it up or move it to another device — nothing is uploaded.',
    importedTitle: 'Backup imported',
    importedMsg: (n) => `${n} ${n === 1 ? 'group' : 'groups'} imported. Existing groups with the same id were updated.`,
    importFailedTitle: 'Import failed',
    nothingToExport: 'No groups to export yet.',
    ok: 'OK',
    remove: 'Remove',
    deleteGroupTitle: 'Delete this group?',
    deleteGroupMsg: (n) => `"${n}" and all its expenses will be permanently removed.`,
    deleteGroupUnsettled: (n) =>
      `"${n}" still has unsettled balances. Deleting it discards who owes whom. Delete anyway?`,
    deleteExpenseTitle: 'Delete expense?',
    deleteExpenseMsg: 'This expense will be permanently removed. This can’t be undone.',
    removeMemberTitle: 'Remove member?',
    removeMemberMsg: (n) => `Remove ${n} from this group?`,
    cantRemoveTitle: 'Involved in expenses',
    cantRemoveMsg: (n) => `${n} is part of existing expenses. Remove those first.`,
  },
  ja: {
    groups: 'グループ',
    activity: 'アクティビティ',
    settings: '設定',
    tagline: '割り勘をシンプルに',
    welcomeTitle: '割り勘を、美しく。',
    welcomeSub: '旅行・住まい・飲み会の共有費用を記録し、ワンタップで精算。',
    getStarted: 'はじめる',
    continue: '続ける',
    skip: 'あとで',
    setupTitle: '通貨を選択',
    setupSub: '新しいグループ作成時の既定として使われます。',
    defaultCurrency: '既定の通貨',
    totalSpent: '合計支出',
    spent: '支出',
    settleUp: '精算する',
    toSettle: (n) => `精算する送金 ${n} 件`,
    noExpenses: 'まだ支出がありません',
    tapPlus: '＋ で最初の支出を追加',
    paidByOn: (p, d) => `${p}が支払い · ${d}`,
    owes: '支払う',
    getsBack: '受け取る',
    settled: '精算済み',
    settleIntro: '全員が最少の送金で清算できる方法です。',
    markSettled: '精算済みに',
    allSettledTitle: 'すべて精算済み',
    allSettledSub: 'このグループは全員が均等です。',
    inviteMembers: 'メンバーを招待',
    inviteIntro: 'リンクを知っている人は、このグループを閲覧専用で確認できます。',
    inviteHint: 'アカウント不要。どの端末でもリンクが使えます。',
    shareLink: '共有リンク',
    copy: 'コピー',
    copied: 'コピー済み',
    membersCount: (n) => `メンバー · ${n}人`,
    add: '追加',
    addMemberPlaceholder: '名前で友達を追加',
    you: 'あなた',
    done: '完了',
    newGroup: '新規',
    createGroup: 'グループを作成',
    editGroup: 'グループを編集',
    groupName: 'グループ名',
    groupNamePlaceholder: '例：夏の旅行',
    category: 'カテゴリ',
    currency: '通貨',
    members: 'メンバー',
    saveChanges: '変更を保存',
    deleteGroup: 'グループを削除',
    addExpense: '支出を追加',
    editExpense: '支出を編集',
    descPlaceholder: '何の支出？',
    notePlaceholder: 'メモを追加（任意）',
    group: 'グループ',
    whoPaid: '支払った人',
    splitBetween: '分担',
    equal: '均等',
    custom: 'カスタム',
    splitPercent: '%',
    splitShares: '比率',
    remaining: '残り',
    save: '保存',
    cancel: 'キャンセル',
    deleteExpense: '支出を削除',
    needTwoMembers: 'まずこのグループに2人以上のメンバーを追加してください。',
    repeat: '繰り返し',
    repeatNone: 'なし',
    repeatWeekly: '毎週',
    repeatMonthly: '毎月',
    appearance: '外観',
    light: 'ライト',
    dark: 'ダーク',
    glassStyle: 'ガラス',
    frost: 'フロスト',
    clear: 'クリア',
    glassDescFrost: '柔らかく不透明なフロストパネル。落ち着いて読みやすい。',
    glassDescClear: '薄く透明感のあるガラス。よりリキッドで奥行きのある表現。',
    language: '言語',
    replayOnboarding: 'チュートリアルを再生',
    data: 'データ',
    exportBackup: 'バックアップを書き出す (JSON)',
    exportCsv: '支出を書き出す (CSV)',
    importBackup: 'バックアップを読み込む',
    dataPrivacyNote: 'データはこの端末にのみ保存されます。バックアップや他端末への移行に使えます。どこにもアップロードされません。',
    importedTitle: 'バックアップを読み込みました',
    importedMsg: (n) => `${n}件のグループを読み込みました。同じIDの既存グループは更新されました。`,
    importFailedTitle: '読み込みに失敗しました',
    nothingToExport: '書き出すグループがまだありません。',
    ok: 'OK',
    remove: '削除',
    deleteGroupTitle: 'グループを削除しますか？',
    deleteGroupMsg: (n) => `「${n}」とすべての支出が完全に削除されます。`,
    deleteGroupUnsettled: (n) =>
      `「${n}」には未精算の残高があります。削除すると貸し借りの記録も失われます。削除しますか？`,
    deleteExpenseTitle: '支出を削除しますか？',
    deleteExpenseMsg: 'この支出は完全に削除されます。元に戻せません。',
    removeMemberTitle: 'メンバーを削除しますか？',
    removeMemberMsg: (n) => `${n}をこのグループから削除しますか？`,
    cantRemoveTitle: '支出に関与しています',
    cantRemoveMsg: (n) => `${n}は既存の支出に含まれています。先にその支出を削除してください。`,
  },
  zh: {
    groups: '群组',
    activity: '动态',
    settings: '设置',
    tagline: '轻松分账',
    welcomeTitle: '优雅地分账。',
    welcomeSub: '记录旅行、合租和聚会的共同支出，一键结清。',
    getStarted: '开始使用',
    continue: '继续',
    skip: '暂时跳过',
    setupTitle: '选择货币',
    setupSub: '创建新群组时作为默认货币。',
    defaultCurrency: '默认货币',
    totalSpent: '总支出',
    spent: '支出',
    settleUp: '结算',
    toSettle: (n) => `${n} 笔待结算转账`,
    noExpenses: '还没有支出',
    tapPlus: '点击 + 添加第一笔',
    paidByOn: (p, d) => `${p} 付款 · ${d}`,
    owes: '应付',
    getsBack: '应收',
    settled: '已结清',
    settleIntro: '让所有人以最少的转账结清。',
    markSettled: '标记结清',
    allSettledTitle: '全部结清',
    allSettledSub: '此群组已经两清。',
    inviteMembers: '邀请成员',
    inviteIntro: '任何拥有链接的人都可以以只读方式查看此群组。',
    inviteHint: '无需账户，链接在任何设备上都可使用。',
    shareLink: '分享链接',
    copy: '复制',
    copied: '已复制',
    membersCount: (n) => `成员 · ${n} 人`,
    add: '添加',
    addMemberPlaceholder: '输入朋友名字',
    you: '你',
    done: '完成',
    newGroup: '新建',
    createGroup: '创建群组',
    editGroup: '编辑群组',
    groupName: '群组名称',
    groupNamePlaceholder: '例如：夏日旅行',
    category: '分类',
    currency: '货币',
    members: '成员',
    saveChanges: '保存更改',
    deleteGroup: '删除群组',
    addExpense: '添加支出',
    editExpense: '编辑支出',
    descPlaceholder: '这笔用于？',
    notePlaceholder: '添加备注（可选）',
    group: '群组',
    whoPaid: '谁付款',
    splitBetween: '分摊',
    equal: '均分',
    custom: '自定义',
    splitPercent: '%',
    splitShares: '份额',
    remaining: '剩余',
    save: '保存',
    cancel: '取消',
    deleteExpense: '删除支出',
    needTwoMembers: '请先为此群组添加至少 2 名成员。',
    repeat: '重复',
    repeatNone: '不重复',
    repeatWeekly: '每周',
    repeatMonthly: '每月',
    appearance: '外观',
    light: '浅色',
    dark: '深色',
    glassStyle: '玻璃质感',
    frost: '磨砂',
    clear: '通透',
    glassDescFrost: '柔和、不透明的磨砂面板，沉稳易读。',
    glassDescClear: '轻薄通透的玻璃，边缘高光清晰，更具流动感与层次。',
    language: '语言',
    replayOnboarding: '重新观看引导',
    data: '数据',
    exportBackup: '导出备份 (JSON)',
    exportCsv: '导出支出 (CSV)',
    importBackup: '导入备份',
    dataPrivacyNote: '你的数据仅保存在此设备上。可用于备份或迁移到其他设备，不会上传到任何地方。',
    importedTitle: '备份已导入',
    importedMsg: (n) => `已导入 ${n} 个群组。相同 ID 的现有群组已更新。`,
    importFailedTitle: '导入失败',
    nothingToExport: '还没有可导出的群组。',
    ok: '知道了',
    remove: '移除',
    deleteGroupTitle: '删除此群组？',
    deleteGroupMsg: (n) => `“${n}”及其所有支出将被永久删除。`,
    deleteGroupUnsettled: (n) => `“${n}”仍有未结清的余额。删除会丢失谁欠谁的记录。仍要删除吗？`,
    deleteExpenseTitle: '删除支出？',
    deleteExpenseMsg: '此支出将被永久删除，无法撤销。',
    removeMemberTitle: '移除成员？',
    removeMemberMsg: (n) => `将${n}从此群组移除？`,
    cantRemoveTitle: '已参与支出',
    cantRemoveMsg: (n) => `${n}已包含在现有支出中，请先删除相关支出。`,
  },
};
