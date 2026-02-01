export type Language = 'en' | 'ja' | 'zh';

export interface Translations {
  // Common
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  back: string;
  language: string;

  // App title
  appTitle: string;
  appTagline: string;

  // Home page
  newGroup: string;
  noGroupsYet: string;
  noGroupsMessage: string;
  createGroup: string;
  members: string;
  expenses: string;
  updated: string;

  // Group
  groupName: string;
  description: string;
  descriptionOptional: string;
  createNewGroup: string;
  createGroupMessage: string;

  // Person
  addPerson: string;
  addPersonMessage: string;
  personName: string;
  noMembersYet: string;
  noMembersMessage: string;
  addFirstMember: string;
  addMembers: string;

  // Expense
  addExpense: string;
  addExpenseMessage: string;
  expenseDescription: string;
  amount: string;
  amountValidation: string;
  paidBy: string;
  splitType: string;
  equalSplit: string;
  customSplit: string;
  splitAmong: string;
  customAmounts: string;
  remaining: string;
  noExpensesYet: string;
  noExpensesMessage: string;
  deleteExpense: string;
  editExpense: string;
  split: string;

  // Balance
  balances: string;
  netBalances: string;
  getsBack: string;
  owes: string;
  settledUp: string;
  suggestedPayments: string;
  settle: string;
  allSettled: string;
  allSettledMessage: string;
  markSettled: string;

  // Time
  today: string;
  yesterday: string;
  daysAgo: string;

  // Share
  shareGroup: string;
  shareGroupMessage: string;
  copyLink: string;
  linkCopied: string;

  // Errors
  errorLoadingGroups: string;
  errorSavingData: string;
  cannotRemovePerson: string;
  cannotRemovePersonMessage: string;

  // Auto-adjust
  autoAdjust: string;
  splitsNotMatching: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    language: 'Language',

    // App title
    appTitle: 'Bill Splitter',
    appTagline: 'Split expenses and settle debts with friends',

    // Home page
    newGroup: 'New Group',
    noGroupsYet: 'No groups yet',
    noGroupsMessage: 'Create your first group to start splitting expenses',
    createGroup: 'Create Group',
    members: 'members',
    expenses: 'expenses',
    updated: 'Updated',

    // Group
    groupName: 'Group Name',
    description: 'Description',
    descriptionOptional: 'Description (Optional)',
    createNewGroup: 'Create New Group',
    createGroupMessage: 'Create a group to split expenses with friends',

    // Person
    addPerson: 'Add Person',
    addPersonMessage: 'Add a new member to this group',
    personName: 'Name',
    noMembersYet: 'No members yet. Add people to start splitting expenses.',
    noMembersMessage: 'No members yet. Add people to start splitting expenses.',
    addFirstMember: 'Add First Member',
    addMembers: 'Add Members',

    // Expense
    addExpense: 'Add Expense',
    addExpenseMessage: 'Record a new expense for this group',
    expenseDescription: 'Description',
    amount: 'Amount',
    amountValidation: 'Amount must be greater than 0',
    paidBy: 'Paid By',
    splitType: 'Split Type',
    equalSplit: 'Equal Split',
    customSplit: 'Custom Split',
    splitAmong: 'Split Among',
    customAmounts: 'Custom Amounts',
    remaining: 'Remaining',
    noExpensesYet: 'No expenses yet',
    noExpensesMessage: 'Add an expense to start tracking who owes whom',
    deleteExpense: 'Delete this expense?',
    editExpense: 'Edit Expense',
    split: 'split',

    // Balance
    balances: 'Balances',
    netBalances: 'Net Balances',
    getsBack: 'Gets back',
    owes: 'Owes',
    settledUp: 'Settled up',
    suggestedPayments: 'Suggested Payments',
    settle: 'Settle',
    allSettled: 'All Settled!',
    allSettledMessage: 'Everyone is even. Great job tracking your expenses!',
    markSettled: 'Mark payment as settled?',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',

    // Share
    shareGroup: 'Share Group',
    shareGroupMessage: 'Share this group with others',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',

    // Errors
    errorLoadingGroups: 'Failed to load groups',
    errorSavingData: 'Failed to save data',
    cannotRemovePerson: 'Cannot remove this person',
    cannotRemovePersonMessage: 'This person is involved in existing expenses.',

    // Auto-adjust
    autoAdjust: 'Auto-adjust',
    splitsNotMatching: 'Custom splits must sum to the total amount',
  },

  ja: {
    // Common
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    back: '戻る',
    language: '言語',

    // App title
    appTitle: '割り勘アプリ',
    appTagline: '友達と経費を分割して清算',

    // Home page
    newGroup: '新規グループ',
    noGroupsYet: 'グループがありません',
    noGroupsMessage: '最初のグループを作成して経費の分割を始めましょう',
    createGroup: 'グループを作成',
    members: 'メンバー',
    expenses: '経費',
    updated: '更新',

    // Group
    groupName: 'グループ名',
    description: '説明',
    descriptionOptional: '説明（オプション）',
    createNewGroup: '新規グループを作成',
    createGroupMessage: '友達と経費を分割するグループを作成',

    // Person
    addPerson: 'メンバーを追加',
    addPersonMessage: 'このグループに新しいメンバーを追加',
    personName: '名前',
    noMembersYet: 'メンバーがいません。経費を分割するにはメンバーを追加してください。',
    noMembersMessage: 'メンバーがいません。経費を分割するにはメンバーを追加してください。',
    addFirstMember: '最初のメンバーを追加',
    addMembers: 'メンバーを追加',

    // Expense
    addExpense: '経費を追加',
    addExpenseMessage: 'このグループの新しい経費を記録',
    expenseDescription: '内容',
    amount: '金額',
    amountValidation: '金額は0より大きい必要があります',
    paidBy: '支払者',
    splitType: '分割方法',
    equalSplit: '均等割り',
    customSplit: 'カスタム割り',
    splitAmong: '分割対象',
    customAmounts: 'カスタム金額',
    remaining: '残り',
    noExpensesYet: '経費がありません',
    noExpensesMessage: '経費を追加して誰が誰に借りているかを追跡しましょう',
    deleteExpense: 'この経費を削除しますか？',
    editExpense: '経費を編集',
    split: '割り勘',

    // Balance
    balances: '残高',
    netBalances: '純残高',
    getsBack: '受け取る',
    owes: '支払う',
    settledUp: '精算済み',
    suggestedPayments: '推奨される支払い',
    settle: '精算',
    allSettled: 'すべて精算完了！',
    allSettledMessage: '全員が均等です。経費の追跡、お疲れ様でした！',
    markSettled: '支払いを精算済みとしてマークしますか？',

    // Time
    today: '今日',
    yesterday: '昨日',
    daysAgo: '日前',

    // Share
    shareGroup: 'グループを共有',
    shareGroupMessage: 'このグループを他の人と共有',
    copyLink: 'リンクをコピー',
    linkCopied: 'リンクをコピーしました！',

    // Errors
    errorLoadingGroups: 'グループの読み込みに失敗しました',
    errorSavingData: 'データの保存に失敗しました',
    cannotRemovePerson: 'このメンバーを削除できません',
    cannotRemovePersonMessage: 'このメンバーは既存の経費に関与しています。',

    // Auto-adjust
    autoAdjust: '自動調整',
    splitsNotMatching: 'カスタム分割の合計は総額と一致する必要があります',
  },

  zh: {
    // Common
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    language: '语言',

    // App title
    appTitle: '账单分摊',
    appTagline: '与朋友分摊费用和结算债务',

    // Home page
    newGroup: '新建群组',
    noGroupsYet: '还没有群组',
    noGroupsMessage: '创建您的第一个群组开始分摊费用',
    createGroup: '创建群组',
    members: '成员',
    expenses: '费用',
    updated: '更新于',

    // Group
    groupName: '群组名称',
    description: '描述',
    descriptionOptional: '描述（可选）',
    createNewGroup: '创建新群组',
    createGroupMessage: '创建一个群组与朋友分摊费用',

    // Person
    addPerson: '添加成员',
    addPersonMessage: '向此群组添加新成员',
    personName: '姓名',
    noMembersYet: '还没有成员。添加成员以开始分摊费用。',
    noMembersMessage: '还没有成员。添加成员以开始分摊费用。',
    addFirstMember: '添加第一个成员',
    addMembers: '添加成员',

    // Expense
    addExpense: '添加费用',
    addExpenseMessage: '为此群组记录新费用',
    expenseDescription: '描述',
    amount: '金额',
    amountValidation: '金额必须大于0',
    paidBy: '付款人',
    splitType: '分摊方式',
    equalSplit: '平均分摊',
    customSplit: '自定义分摊',
    splitAmong: '分摊对象',
    customAmounts: '自定义金额',
    remaining: '剩余',
    noExpensesYet: '还没有费用',
    noExpensesMessage: '添加费用以开始追踪谁欠谁钱',
    deleteExpense: '删除此费用？',
    editExpense: '编辑费用',
    split: '分摊',

    // Balance
    balances: '余额',
    netBalances: '净余额',
    getsBack: '应收',
    owes: '应付',
    settledUp: '已结清',
    suggestedPayments: '建议付款',
    settle: '结算',
    allSettled: '全部结清！',
    allSettledMessage: '所有人已结清。很好地追踪了您的费用！',
    markSettled: '标记付款为已结算？',

    // Time
    today: '今天',
    yesterday: '昨天',
    daysAgo: '天前',

    // Share
    shareGroup: '分享群组',
    shareGroupMessage: '与他人分享此群组',
    copyLink: '复制链接',
    linkCopied: '链接已复制！',

    // Errors
    errorLoadingGroups: '加载群组失败',
    errorSavingData: '保存数据失败',
    cannotRemovePerson: '无法删除此成员',
    cannotRemovePersonMessage: '此成员参与了现有费用。',

    // Auto-adjust
    autoAdjust: '自动调整',
    splitsNotMatching: '自定义分摊总额必须与总金额相符',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
};
