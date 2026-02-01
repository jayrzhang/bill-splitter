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
import type { Split } from '@/types';
import { calculateEqualSplits, validateSplits } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';

interface AddExpenseDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddExpenseDialog({ groupId, open, onOpenChange }: AddExpenseDialogProps) {
  const { groups, addExpense } = useApp();
  const group = groups.find((g) => g.id === groupId);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Split[]>([]);

  // Initialize paidBy and selectedMembers when dialog opens
  useEffect(() => {
    if (open && group && group.members.length > 0) {
      if (!paidBy) setPaidBy(group.members[0].id);
      if (selectedMembers.length === 0) {
        setSelectedMembers(group.members.map((m) => m.id));
      }
    }
  }, [open, group, paidBy, selectedMembers.length]);

  // Update custom splits when amount or selected members change
  useEffect(() => {
    if (splitType === 'custom' && amount && selectedMembers.length > 0) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        const equalSplits = calculateEqualSplits(amountNum, selectedMembers);
        setCustomSplits(equalSplits);
      }
    }
  }, [amount, selectedMembers, splitType]);

  if (!group) return null;

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

    addExpense({
      groupId,
      description: description.trim(),
      amount: amountNum,
      paidBy,
      splitType,
      splits,
      date: new Date(),
    });

    // Reset form
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setSelectedMembers(group.members.map((m) => m.id));
    setCustomSplits([]);
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
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for this group
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({group.currencySymbol}) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
                  onClick={() => setSplitType('equal')}
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

            {/* Split Among */}
            {splitType === 'equal' && (
              <div className="space-y-2">
                <Label>Split Among</Label>
                <div className="flex flex-wrap gap-2">
                  {group.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        selectedMembers.includes(member.id)
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
            )}

            {/* Custom Splits */}
            {splitType === 'custom' && amountNum > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Custom Amounts</Label>
                  <span
                    className={`text-sm font-medium ${
                      Math.abs(remaining) < 0.01 ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    Remaining: {formatCurrency(remaining, group.currencySymbol)}
                  </span>
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
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
