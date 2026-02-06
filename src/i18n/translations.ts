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
  currency: string;
  editGroup: string;
  editGroupMessage: string;
  saveChanges: string;
  deleteGroup: string;
  deleteGroupConfirm: string;
  goToHome: string;
  backToGroups: string;
  share: string;
  noGroupSelected: string;
  noGroupMessage: string;

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
  editExpenseMessage: string;
  split: string;
  paidByLabel: string;
  expensePlaceholder: string;
  newMember: string;
  membersCount: string;

  // Balance
  balances: string;
  netBalances: string;
  getsBack: string;
  owes: string;
  settledUp: string;
  suggestedPayments: string;
  shouldPay: string;
  to: string;
  settle: string;
  allSettled: string;
  allSettledMessage: string;
  markSettled: string;

  // Categories
  category: string;
  expenseCategory: string;
  groupCategory: string;
  startDate: string;
  endDate: string;
  startDateOptional: string;
  endDateOptional: string;
  endDateMustBeAfterStartDate: string;

  // Expense category names
  categoryFood: string;
  categoryAccommodation: string;
  categoryTransport: string;
  categoryEntertainment: string;
  categoryShopping: string;
  categoryUtilities: string;
  categoryOther: string;

  // Group category names
  categoryTravel: string;
  categoryDinner: string;
  categoryColleagues: string;
  categoryRoommates: string;
  categoryWedding: string;

  // Time
  today: string;
  yesterday: string;
  daysAgo: string;

  // Share
  shareGroup: string;
  shareGroupMessage: string;
  shareGroupDescription: string;
  copyLink: string;
  copyShareLink: string;
  linkCopied: string;
  copiedToClipboard: string;
  howItWorks: string;
  shareNote1: string;
  shareNote2: string;

  // Read-only view
  readOnlyView: string;
  readOnlyMessage: string;

  // Errors
  errorLoadingGroups: string;
  errorSavingData: string;
  cannotRemovePerson: string;
  cannotRemovePersonMessage: string;
  groupNotFound: string;
  groupNotFoundMessage: string;
  groupNotFoundWhy: string;
  groupNotFoundExplanation: string;
  addAtLeast2Members: string;
  noBalancesYet: string;
  addMembersAndExpenses: string;

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
    appTitle: 'Splitaa',
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
    currency: 'Currency',
    editGroup: 'Edit Group',
    editGroupMessage: 'Update the group name and description',
    saveChanges: 'Save Changes',
    deleteGroup: 'Delete',
    deleteGroupConfirm: 'Delete this group? This will permanently remove all expenses and data.',
    goToHome: 'Go to Home',
    backToGroups: 'Back to Groups',
    share: 'Share',
    noGroupSelected: 'No group selected',
    noGroupMessage: 'Please select a group to continue',

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
    editExpenseMessage: 'Update the details of this expense',
    split: 'split',
    paidByLabel: 'Paid by',
    expensePlaceholder: 'Dinner at restaurant',
    newMember: 'New',
    membersCount: 'Members ({count})',

    // Balance
    balances: 'Balances',
    netBalances: 'Net Balances',
    getsBack: 'Gets back',
    owes: 'Owes',
    settledUp: 'Settled up',
    suggestedPayments: 'Suggested Payments',
    shouldPay: 'should pay',
    to: 'to',
    settle: 'Settle',
    allSettled: 'All Settled!',
    allSettledMessage: 'Everyone is even. Great job tracking your expenses!',
    markSettled: 'Mark payment as settled?',

    // Categories
    category: 'Category',
    expenseCategory: 'Expense Category',
    groupCategory: 'Group Category',
    startDate: 'Start Date',
    endDate: 'End Date',
    startDateOptional: 'Start Date (Optional)',
    endDateOptional: 'End Date (Optional)',
    endDateMustBeAfterStartDate: 'End date must be after start date',

    // Expense category names
    categoryFood: 'Food',
    categoryAccommodation: 'Accommodation',
    categoryTransport: 'Transport',
    categoryEntertainment: 'Entertainment',
    categoryShopping: 'Shopping',
    categoryUtilities: 'Utilities',
    categoryOther: 'Other',

    // Group category names
    categoryTravel: 'Travel',
    categoryDinner: 'Dinner',
    categoryColleagues: 'Colleagues',
    categoryRoommates: 'Roommates',
    categoryWedding: 'Wedding/Event',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',

    // Share
    shareGroup: 'Share Group',
    shareGroupMessage: 'Share this group with others',
    shareGroupDescription: 'Share a read-only snapshot of this group including all expenses and balances. Recipients can view but cannot edit.',
    copyLink: 'Copy Link',
    copyShareLink: 'Copy Share Link',
    linkCopied: 'Link copied!',
    copiedToClipboard: 'Copied to Clipboard!',
    howItWorks: 'How it works:',
    shareNote1: 'The link contains a compressed snapshot of your group data.',
    shareNote2: 'Recipients can view expenses and balances in read-only mode. To make their own changes, they need to create a new group.',

    // Read-only view
    readOnlyView: 'Read-Only View',
    readOnlyMessage: 'You\'re viewing a shared snapshot of this group. You cannot make changes. To track your own expenses, create a new group or import this one to your account.',

    // Errors
    errorLoadingGroups: 'Failed to load groups',
    errorSavingData: 'Failed to save data',
    cannotRemovePerson: 'Cannot remove this person',
    cannotRemovePersonMessage: 'This person is involved in existing expenses.',
    groupNotFound: 'Group Not Found',
    groupNotFoundMessage: 'This group doesn\'t exist in your browser\'s storage.',
    groupNotFoundWhy: 'Why?',
    groupNotFoundExplanation: 'This app uses local storage - data only exists on the device where it was created. If you received a share link, it only contains the group structure (name, members). You\'ll need to create expenses together.',
    addAtLeast2Members: 'Add at least 2 members to start tracking expenses',
    noBalancesYet: 'No balances to display yet',
    addMembersAndExpenses: 'Add members and expenses to see balances',

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
    appTitle: 'Splitaa',
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
    currency: '通貨',
    editGroup: 'グループを編集',
    editGroupMessage: 'グループ名と説明を更新',
    saveChanges: '変更を保存',
    deleteGroup: '削除',
    deleteGroupConfirm: 'このグループを削除しますか？すべての経費とデータが完全に削除されます。',
    goToHome: 'ホームへ',
    backToGroups: 'グループ一覧へ戻る',
    share: '共有',
    noGroupSelected: 'グループが選択されていません',
    noGroupMessage: '続けるにはグループを選択してください',

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
    editExpenseMessage: 'この経費の詳細を更新',
    split: '割り勘',
    paidByLabel: 'が支払った',
    expensePlaceholder: 'レストランでの夕食',
    newMember: '新規',
    membersCount: 'メンバー（{count}人）',

    // Balance
    balances: '残高',
    netBalances: '純残高',
    getsBack: '受け取る',
    owes: '支払う',
    settledUp: '精算済み',
    suggestedPayments: '推奨される支払い',
    shouldPay: 'が支払う',
    to: 'に',
    settle: '精算',
    allSettled: 'すべて精算完了！',
    allSettledMessage: '全員が均等です。経費の追跡、お疲れ様でした！',
    markSettled: '支払いを精算済みとしてマークしますか？',

    // Categories
    category: 'カテゴリ',
    expenseCategory: '経費カテゴリ',
    groupCategory: 'グループカテゴリ',
    startDate: '開始日',
    endDate: '終了日',
    startDateOptional: '開始日（オプション）',
    endDateOptional: '終了日（オプション）',
    endDateMustBeAfterStartDate: '終了日は開始日より後でなければなりません',

    // Expense category names
    categoryFood: '食事',
    categoryAccommodation: '宿泊',
    categoryTransport: '交通',
    categoryEntertainment: 'エンターテイメント',
    categoryShopping: '買い物',
    categoryUtilities: '光熱費',
    categoryOther: 'その他',

    // Group category names
    categoryTravel: '旅行',
    categoryDinner: '食事会',
    categoryColleagues: '同僚',
    categoryRoommates: 'ルームメイト',
    categoryWedding: '結婚式/イベント',

    // Time
    today: '今日',
    yesterday: '昨日',
    daysAgo: '日前',

    // Share
    shareGroup: 'グループを共有',
    shareGroupMessage: 'このグループを他の人と共有',
    shareGroupDescription: 'すべての経費と残高を含むグループの読み取り専用スナップショットを共有します。受信者は閲覧のみ可能で、編集はできません。',
    copyLink: 'リンクをコピー',
    copyShareLink: '共有リンクをコピー',
    linkCopied: 'リンクをコピーしました！',
    copiedToClipboard: 'クリップボードにコピーしました！',
    howItWorks: '仕組み：',
    shareNote1: 'リンクにはグループデータの圧縮スナップショットが含まれています。',
    shareNote2: '受信者は経費と残高を読み取り専用モードで閲覧できます。独自の変更を行うには、新しいグループを作成する必要があります。',

    // Read-only view
    readOnlyView: '読み取り専用表示',
    readOnlyMessage: 'このグループの共有スナップショットを表示しています。変更はできません。独自の経費を追跡するには、新しいグループを作成するか、これをアカウントにインポートしてください。',

    // Errors
    errorLoadingGroups: 'グループの読み込みに失敗しました',
    errorSavingData: 'データの保存に失敗しました',
    cannotRemovePerson: 'このメンバーを削除できません',
    cannotRemovePersonMessage: 'このメンバーは既存の経費に関与しています。',
    groupNotFound: 'グループが見つかりません',
    groupNotFoundMessage: 'このグループはブラウザのストレージに存在しません。',
    groupNotFoundWhy: '理由',
    groupNotFoundExplanation: 'このアプリはローカルストレージを使用しています。データは作成されたデバイスにのみ存在します。共有リンクを受け取った場合、グループ構造（名前、メンバー）のみが含まれます。一緒に経費を作成する必要があります。',
    addAtLeast2Members: '経費の追跡を開始するには、少なくとも2人のメンバーを追加してください',
    noBalancesYet: '表示する残高がありません',
    addMembersAndExpenses: 'メンバーと経費を追加して残高を表示',

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
    appTitle: 'Splitaa',
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
    currency: '货币',
    editGroup: '编辑群组',
    editGroupMessage: '更新群组名称和描述',
    saveChanges: '保存更改',
    deleteGroup: '删除',
    deleteGroupConfirm: '删除此群组？这将永久删除所有费用和数据。',
    goToHome: '返回首页',
    backToGroups: '返回群组列表',
    share: '分享',
    noGroupSelected: '未选择群组',
    noGroupMessage: '请选择一个群组以继续',

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
    editExpenseMessage: '更新此费用的详细信息',
    split: '分摊',
    paidByLabel: '由',
    expensePlaceholder: '餐厅晚餐',
    newMember: '新',
    membersCount: '成员（{count}人）',

    // Balance
    balances: '余额',
    netBalances: '净余额',
    getsBack: '应收',
    owes: '应付',
    settledUp: '已结清',
    suggestedPayments: '建议付款',
    shouldPay: '应付',
    to: '给',
    settle: '结算',
    allSettled: '全部结清！',
    allSettledMessage: '所有人已结清。很好地追踪了您的费用！',
    markSettled: '标记付款为已结算？',

    // Categories
    category: '类别',
    expenseCategory: '费用类别',
    groupCategory: '群组类别',
    startDate: '开始日期',
    endDate: '结束日期',
    startDateOptional: '开始日期（可选）',
    endDateOptional: '结束日期（可选）',
    endDateMustBeAfterStartDate: '结束日期必须晚于开始日期',

    // Expense category names
    categoryFood: '食物',
    categoryAccommodation: '住宿',
    categoryTransport: '交通',
    categoryEntertainment: '娱乐',
    categoryShopping: '购物',
    categoryUtilities: '水电费',
    categoryOther: '其他',

    // Group category names
    categoryTravel: '旅行',
    categoryDinner: '聚餐',
    categoryColleagues: '同事',
    categoryRoommates: '室友',
    categoryWedding: '婚礼/活动',

    // Time
    today: '今天',
    yesterday: '昨天',
    daysAgo: '天前',

    // Share
    shareGroup: '分享群组',
    shareGroupMessage: '与他人分享此群组',
    shareGroupDescription: '分享包含所有费用和余额的群组只读快照。接收者可以查看但无法编辑。',
    copyLink: '复制链接',
    copyShareLink: '复制分享链接',
    linkCopied: '链接已复制！',
    copiedToClipboard: '已复制到剪贴板！',
    howItWorks: '工作原理：',
    shareNote1: '链接包含您群组数据的压缩快照。',
    shareNote2: '接收者可以以只读模式查看费用和余额。要进行自己的更改，他们需要创建新群组。',

    // Read-only view
    readOnlyView: '只读视图',
    readOnlyMessage: '您正在查看此群组的共享快照。您无法进行更改。要追踪您自己的费用，请创建新群组或将此群组导入到您的账户。',

    // Errors
    errorLoadingGroups: '加载群组失败',
    errorSavingData: '保存数据失败',
    cannotRemovePerson: '无法删除此成员',
    cannotRemovePersonMessage: '此成员参与了现有费用。',
    groupNotFound: '未找到群组',
    groupNotFoundMessage: '此群组不存在于您的浏览器存储中。',
    groupNotFoundWhy: '为什么？',
    groupNotFoundExplanation: '此应用使用本地存储 - 数据仅存在于创建它的设备上。如果您收到了共享链接，它仅包含群组结构（名称、成员）。您需要一起创建费用。',
    addAtLeast2Members: '至少添加2个成员以开始追踪费用',
    noBalancesYet: '暂无余额显示',
    addMembersAndExpenses: '添加成员和费用以查看余额',

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
