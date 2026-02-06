import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Receipt, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { listItem, staggerContainer } from '@/styles/animations';
import { formatCurrency, formatDate } from '@/lib/utils';
import EditExpenseDialog from './EditExpenseDialog';
import type { Expense, Group } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface ExpenseListProps {
  groupId: string;
  readOnly?: boolean;
  group?: Group; // Optional prop for readonly mode
}

export default function ExpenseList({ groupId, readOnly = false, group: propGroup }: ExpenseListProps) {
  const { groups, deleteExpense } = useApp();
  const { t } = useLanguage();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const group = propGroup || groups.find((g) => g.id === groupId);

  if (!group) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerson = (personId: string) => {
    return group.members.find((m) => m.id === personId);
  };

  const getCategoryDetails = (categoryId: string | undefined) => {
    if (!categoryId) return null;
    return EXPENSE_CATEGORIES.find((cat) => cat.id === categoryId);
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

  const sortedExpenses = [...group.expenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <div className="mx-auto w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t.noExpensesYet}</h3>
        <p className="text-muted-foreground">
          {t.noExpensesMessage}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={`expenses-${sortedExpenses.length}`}
      className="space-y-3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {sortedExpenses.map((expense) => {
        const payer = getPerson(expense.paidBy);
        if (!payer) return null;

        return (
          <motion.div key={expense.id} variants={listItem}>
            <Card className="group hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-0.5 flex-shrink-0" style={{ backgroundColor: payer.color }}>
                      <AvatarFallback
                        className="text-white font-medium text-xs sm:text-sm"
                        style={{ backgroundColor: payer.color }}
                      >
                        {getInitials(payer.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold mb-1 truncate">{expense.description}</h4>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {expense.category && (() => {
                          const categoryDetails = getCategoryDetails(expense.category);
                          if (!categoryDetails) return null;
                          return (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: categoryDetails.color + '20',
                                color: categoryDetails.color
                              }}
                            >
                              <span>{categoryDetails.icon}</span>
                              <span className="hidden sm:inline">{getCategoryName(categoryDetails.id)}</span>
                            </span>
                          );
                        })()}
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {t.paidByLabel} {payer.name} • {formatDate(expense.date)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {expense.splits.map((split) => {
                          const person = getPerson(split.personId);
                          if (!person) return null;

                          return (
                            <div
                              key={split.personId}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs"
                            >
                              <span className="font-medium">{person.name}</span>
                              <span className="text-muted-foreground">
                                {formatCurrency(split.amount, group.currencySymbol)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:items-start gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right order-2 sm:order-1">
                      <div className="text-base sm:text-lg font-bold whitespace-nowrap">
                        {formatCurrency(expense.amount, group.currencySymbol)}
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {expense.splitType === 'equal' ? t.equalSplit : t.customSplit}
                      </div>
                    </div>

                    {!readOnly && (
                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity order-1 sm:order-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingExpense(expense);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t.deleteExpense + '?')) {
                              deleteExpense(expense.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      {!readOnly && (
        <EditExpenseDialog
          expense={editingExpense}
          open={editingExpense !== null}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}
    </motion.div>
  );
}
