import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Expense, Split } from '@/types';
import { calculateEqualSplits, validateSplits } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';

interface EditExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditExpenseDialog({ expense, open, onOpenChange }: EditExpenseDialogProps) {
  const { groups, updateExpense } = useApp();
  const group = expense ? groups.find((g) => g.id === expense.groupId) : null;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Split[]>([]);

  // Initialize form when expense changes
  useEffect(() => {
    if (expense && group) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setPaidBy(expense.paidBy);
      setSplitType(expense.splitType);
      setSelectedMembers(expense.splits.map(s => s.personId));
      setCustomSplits(expense.splits);
    }
  }, [expense, group]);

  if (!expense || !group) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const updateCustomSplit = (personId: string, newAmount: string) => {
    const amountNum = parseFloat(newAmount) || 0;
    setCustomSplits((prev) =>
      prev.map((split) =>
        split.personId === personId ? { ...split, amount: amountNum } : split
      )
    );
  };

  const autoAdjustSplits = () => {
    if (customSplits.length === 0) return;

    const amountNum = parseFloat(amount);
    const totalCustomSplit = customSplits.reduce((sum, s) => sum + s.amount, 0);
    const difference = amountNum - totalCustomSplit;

    const adjusted = customSplits.map((split, index) => {
      if (index === 0) {
        return { ...split, amount: Number((split.amount + difference).toFixed(2)) };
      }
      return split;
    });

    setCustomSplits(adjusted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !paidBy || selectedMembers.length === 0) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    let splits: Split[];
    if (splitType === 'equal') {
      splits = calculateEqualSplits(amountNum, selectedMembers);
    } else {
      splits = customSplits;
      if (!validateSplits(amountNum, splits)) {
        alert('Custom splits must sum to the total amount');
        return;
      }
    }

    updateExpense(expense.id, {
      description: description.trim(),
      amount: amountNum,
      paidBy,
      splitType,
      splits,
    });

    onOpenChange(false);
  };

  const amountNum = parseFloat(amount) || 0;
  const totalCustomSplit = customSplits.reduce((sum, s) => sum + s.amount, 0);
  const remaining = amountNum - totalCustomSplit;
  const isValid =
    description.trim() &&
    amountNum > 0 &&
    paidBy &&
    selectedMembers.length > 0 &&
    (splitType === 'equal' || Math.abs(remaining) < 0.01);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of this expense
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                placeholder="Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount ({group.currencySymbol}) *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && parseFloat(amount) <= 0 && (
                <p className="text-sm text-red-500">Amount must be greater than 0</p>
              )}
            </div>

            {/* Paid By */}
            <div className="space-y-2">
              <Label>Paid By *</Label>
              <div className="flex flex-wrap gap-2">
                {group.members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidBy(member.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      paidBy === member.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Avatar className="h-6 w-6" style={{ backgroundColor: member.color }}>
                      <AvatarFallback
                        className="text-white font-medium text-xs"
                        style={{ backgroundColor: member.color }}
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Type */}
            <div className="space-y-2">
              <Label>Split Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={splitType === 'equal' ? 'default' : 'outline'}
                  onClick={() => {
                    setSplitType('equal');
                    if (amountNum > 0) {
                      setCustomSplits(calculateEqualSplits(amountNum, selectedMembers));
                    }
                  }}
                  className="flex-1"
                >
                  Equal Split
                </Button>
                <Button
                  type="button"
                  variant={splitType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setSplitType('custom')}
                  className="flex-1"
                >
                  Custom Split
                </Button>
              </div>
            </div>

            {/* Custom Splits */}
            {splitType === 'custom' && amountNum > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Custom Amounts</Label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        Math.abs(remaining) < 0.01 ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      Remaining: {formatCurrency(remaining, group.currencySymbol)}
                    </span>
                    {Math.abs(remaining) > 0.01 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={autoAdjustSplits}
                      >
                        Auto-adjust
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {customSplits.map((split) => {
                    const member = group.members.find((m) => m.id === split.personId);
                    if (!member) return null;

                    return (
                      <div key={split.personId} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8" style={{ backgroundColor: member.color }}>
                          <AvatarFallback
                            className="text-white font-medium text-xs"
                            style={{ backgroundColor: member.color }}
                          >
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium flex-1">{member.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{group.currencySymbol}</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={split.amount}
                            onChange={(e) => updateCustomSplit(split.personId, e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
