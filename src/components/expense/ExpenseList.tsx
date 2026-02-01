import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { listItem, staggerContainer } from '@/styles/animations';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseListProps {
  groupId: string;
}

export default function ExpenseList({ groupId }: ExpenseListProps) {
  const { groups, deleteExpense } = useApp();
  const group = groups.find((g) => g.id === groupId);

  if (!group) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerson = (personId: string) => {
    return group.members.find((m) => m.id === personId);
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
        <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
        <p className="text-muted-foreground">
          Add an expense to start tracking who owes whom
        </p>
      </div>
    );
  }

  return (
    <motion.div
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10 mt-0.5" style={{ backgroundColor: payer.color }}>
                      <AvatarFallback
                        className="text-white font-medium text-sm"
                        style={{ backgroundColor: payer.color }}
                      >
                        {getInitials(payer.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1">{expense.description}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Paid by {payer.name} • {formatDate(expense.date)}
                      </p>

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

                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(expense.amount, group.currencySymbol)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {expense.splitType} split
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm('Delete this expense?')) {
                          deleteExpense(expense.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
