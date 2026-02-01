import type { Group, Balance, Debt, Split } from '@/types';

/**
 * Calculate net balances for all members
 * Positive = person is owed money
 * Negative = person owes money
 */
export function calculateBalances(group: Group): Balance[] {
  const balanceMap = new Map<string, number>();

  // Initialize all members with 0 balance
  group.members.forEach((member) => {
    balanceMap.set(member.id, 0);
  });

  // Process all expenses
  group.expenses.forEach((expense) => {
    // Person who paid gets credited
    const currentBalance = balanceMap.get(expense.paidBy) || 0;
    balanceMap.set(expense.paidBy, currentBalance + expense.amount);

    // Everyone who owes gets debited
    expense.splits.forEach((split) => {
      const owedBalance = balanceMap.get(split.personId) || 0;
      balanceMap.set(split.personId, owedBalance - split.amount);
    });
  });

  // Process settlements (reduce debts that were paid)
  group.settlements.forEach((settlement) => {
    // Person who paid reduces their debt (increases balance)
    const fromBalance = balanceMap.get(settlement.fromPersonId) || 0;
    balanceMap.set(settlement.fromPersonId, fromBalance + settlement.amount);

    // Person who received reduces what they're owed (decreases balance)
    const toBalance = balanceMap.get(settlement.toPersonId) || 0;
    balanceMap.set(settlement.toPersonId, toBalance - settlement.amount);
  });

  return Array.from(balanceMap.entries()).map(([personId, netBalance]) => ({
    personId,
    netBalance: Number(netBalance.toFixed(2)), // Round to 2 decimals
  }));
}

/**
 * Greedy algorithm to minimize number of transactions
 * Using max-min matching approach
 */
export function simplifyDebts(balances: Balance[]): Debt[] {
  const debts: Debt[] = [];

  // Separate creditors (owed money) and debtors (owe money)
  const creditors = balances
    .filter((b) => b.netBalance > 0.01) // Ignore negligible amounts
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance); // Descending

  const debtors = balances
    .filter((b) => b.netBalance < -0.01)
    .map((b) => ({ personId: b.personId, netBalance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.netBalance - a.netBalance); // Descending

  let i = 0; // Creditor index
  let j = 0; // Debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.netBalance, debtor.netBalance);

    if (amount > 0.01) {
      // Only create debt if significant
      debts.push({
        from: debtor.personId,
        to: creditor.personId,
        amount: Number(amount.toFixed(2)),
      });
    }

    creditor.netBalance -= amount;
    debtor.netBalance -= amount;

    if (creditor.netBalance < 0.01) i++;
    if (debtor.netBalance < 0.01) j++;
  }

  return debts;
}

/**
 * Calculate equal splits for an expense
 */
export function calculateEqualSplits(
  amount: number,
  memberIds: string[]
): Split[] {
  const perPersonAmount = amount / memberIds.length;
  const roundedAmount = Number(perPersonAmount.toFixed(2));

  const splits: Split[] = memberIds.map((id) => ({
    personId: id,
    amount: roundedAmount,
  }));

  // Handle rounding discrepancy - add difference to first person
  const totalSplit = roundedAmount * memberIds.length;
  const difference = Number((amount - totalSplit).toFixed(2));

  if (difference !== 0 && splits.length > 0) {
    splits[0].amount = Number((splits[0].amount + difference).toFixed(2));
  }

  return splits;
}

/**
 * Validate custom splits sum to total amount
 */
export function validateSplits(amount: number, splits: Split[]): boolean {
  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  return Math.abs(total - amount) < 0.01; // Allow 1 cent tolerance
}

/**
 * Round currency value to 2 decimal places
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
