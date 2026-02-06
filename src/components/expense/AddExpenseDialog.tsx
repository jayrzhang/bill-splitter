import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
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
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Split } from '@/types';
import type { ExpenseCategoryId } from '@/lib/constants';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { calculateEqualSplits, validateSplits } from '@/lib/calculations';
import { formatCurrency, cn } from '@/lib/utils';

interface AddExpenseDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddExpenseDialog({ groupId, open, onOpenChange }: AddExpenseDialogProps) {
  const { groups, addExpense } = useApp();
  const { t } = useLanguage();
  const group = groups.find((g) => g.id === groupId);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryId>('other');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Split[]>([]);

  // Category scroll state
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // Update category scroll buttons
  useEffect(() => {
    if (!open) return;

    const updateScrollButtons = () => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      }
    };

    const rafId = requestAnimationFrame(() => {
      updateScrollButtons();
    });

    const container = categoryScrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        cancelAnimationFrame(rafId);
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }

    return () => cancelAnimationFrame(rafId);
  }, [open]);

  if (!group) return null;

  const scrollCategoryLeft = () => {
    categoryScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollCategoryRight = () => {
    categoryScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      food: t.categoryFood,
      accommodation: t.categoryAccommodation,
      transport: t.categoryTransport,
      entertainment: t.categoryEntertainment,
      shopping: t.categoryShopping,
      utilities: t.categoryUtilities,
      other: t.categoryOther,
    };
    return categoryMap[categoryId] || categoryId;
  };

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

  const addRemainingToPerson = (personId: string) => {
    const amountNum = parseFloat(amount);
    const totalCustomSplit = customSplits.reduce((sum, s) => sum + s.amount, 0);
    const difference = amountNum - totalCustomSplit;

    const adjusted = customSplits.map((split) => {
      if (split.personId === personId) {
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

    addExpense({
      groupId,
      description: description.trim(),
      amount: amountNum,
      category,
      paidBy,
      splitType,
      splits,
      date: new Date(),
    });

    // Reset form
    setDescription('');
    setCategory('other');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
          <form onSubmit={handleSubmit} className="w-full min-w-0">
          <DialogHeader>
            <DialogTitle>{t.addExpense}</DialogTitle>
            <DialogDescription>
              {t.addExpenseMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.expenseDescription} *</Label>
              <Input
                id="description"
                placeholder={t.expensePlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t.category}</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!canScrollLeft}
                  className="h-8 w-8 flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                  onClick={scrollCategoryLeft}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div
                    ref={categoryScrollRef}
                    className="flex flex-nowrap gap-2 overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 touch-none"
                    style={{ scrollbarWidth: 'none' }}
                    onWheel={(e) => e.preventDefault()}
                    onScroll={() => {
                      if (categoryScrollRef.current) {
                        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
                        setCanScrollLeft(scrollLeft > 5);
                        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
                      }
                    }}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all min-w-[70px] flex-shrink-0",
                          category === cat.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-medium">{getCategoryName(cat.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!canScrollRight}
                  className="h-8 w-8 flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                  onClick={scrollCategoryRight}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t.amount} ({group.currencySymbol}) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && parseFloat(amount) <= 0 && (
                <p className="text-sm text-red-500">{t.amountValidation}</p>
              )}
            </div>

            {/* Paid By */}
            <div className="space-y-2">
              <Label>{t.paidBy} *</Label>
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
              <Label>{t.splitType}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={splitType === 'equal' ? 'default' : 'outline'}
                  onClick={() => setSplitType('equal')}
                  className="flex-1"
                >
                  {t.equalSplit}
                </Button>
                <Button
                  type="button"
                  variant={splitType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setSplitType('custom')}
                  className="flex-1"
                >
                  {t.customSplit}
                </Button>
              </div>
            </div>

            {/* Split Among */}
            {splitType === 'equal' && (
              <div className="space-y-2">
                <Label>{t.splitAmong}</Label>
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
                  <Label>{t.customAmounts}</Label>
                  <span
                    className={`text-sm font-medium ${
                      Math.abs(remaining) < 0.01 ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {t.remaining}: {formatCurrency(remaining, group.currencySymbol)}
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
                          {Math.abs(remaining) > 0.01 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => addRemainingToPerson(split.personId)}
                              title={`Add remaining ${formatCurrency(remaining, group.currencySymbol)} to ${member.name}`}
                            >
                              <PlusCircle className="h-4 w-4 text-primary" />
                            </Button>
                          )}
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
              {t.cancel}
            </Button>
            <Button type="submit" disabled={!isValid}>
              {t.addExpense}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
