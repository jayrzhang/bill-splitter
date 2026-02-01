# Bill Splitter

A sophisticated bill-splitting web application for managing group expenses and calculating who owes whom. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Create Groups**: Organize expenses for trips, dinners, or any shared activities
- **Manage Members**: Add people to groups with auto-assigned avatar colors
- **Track Expenses**: Record who paid and how costs should be split (equal or custom)
- **Smart Calculations**: Automatically calculate balances and simplify debts using a greedy algorithm
- **Settle Debts**: Mark payments as settled with one click
- **Local Storage**: All data persists in your browser - no server required
- **Responsive Design**: Mobile-first interface that works beautifully on all devices
- **Premium UI**: Clean, minimal design inspired by Linear, Arc Browser, and Stripe

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **date-fns** - Date formatting

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app runs on [http://localhost:5173](http://localhost:5173) in development mode.

## Usage

### Create a Group
1. Click "New Group" on the home page
2. Enter a group name and optional description
3. Click "Create Group"

### Add Members
1. Open a group
2. Click "Add Person"
3. Enter member names (each person gets a unique color)

### Add an Expense
1. Click "Add Expense" in the Expenses tab
2. Enter description and amount
3. Select who paid
4. Choose split type:
   - **Equal Split**: Divide evenly among selected members
   - **Custom Split**: Specify exact amounts for each person
5. Click "Add Expense"

### View Balances
1. Switch to the "Balances" tab
2. See net balances (who owes/is owed money)
3. View simplified debts (minimal payments needed)
4. Click "Settle" to mark a debt as paid

## Data Model

### Core Concepts

- **Group**: Container for members, expenses, and settlements
- **Person**: Member of a group with a name and color
- **Expense**: Record of a payment with split information
- **Settlement**: Record of a debt being paid off
- **Balance**: Calculated net amount for each person
- **Debt**: Simplified payment between two people

### Debt Simplification Algorithm

The app uses a greedy max-min matching algorithm to minimize the number of transactions needed to settle all debts:

1. Calculate net balance for each person (what they paid - what they owe)
2. Separate into creditors (positive balance) and debtors (negative balance)
3. Match largest creditor with largest debtor
4. Create transaction for the smaller of the two amounts
5. Repeat until all debts are settled

**Example**: If Alice is owed $50, Bob $30, Charlie owes $40, and Dave owes $40:
- Simplified: Charlie pays Alice $40, Dave pays Alice $10, Dave pays Bob $30
- Result: Only 3 transactions instead of 6

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── group/              # Group management components
│   ├── person/             # Person management components
│   ├── expense/            # Expense tracking components
│   └── balance/            # Balance display components
├── context/
│   └── AppContext.tsx      # Global state management
├── lib/
│   ├── calculations.ts     # Balance & debt algorithms
│   ├── storage.ts          # Local storage abstraction
│   ├── utils.ts            # Utility functions
│   └── constants.ts        # App constants
├── pages/
│   ├── Home.tsx            # Group list page
│   └── GroupDetail.tsx     # Group detail page
├── styles/
│   └── animations.ts       # Framer Motion variants
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Root component
└── main.tsx                # Entry point
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Note**: Requires localStorage support. Data is stored locally and not synced across devices.

## Future Enhancements

- Multi-currency support with exchange rates
- Expense categories and filtering
- Receipt photo uploads
- Export to PDF/CSV
- Share group via link
- Dark mode
- Offline PWA support
- Cloud sync with backend
- Payment integrations (Venmo, Cash App, etc.)

## License

MIT

---

Built with Claude Code
