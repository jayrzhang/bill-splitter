import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { listItem, staggerContainer } from '@/styles/animations';
import { formatCurrency } from '@/lib/utils';
import type { Debt, Group } from '@/types';
import { calculateBalances, simplifyDebts } from '@/lib/calculations';

interface BalanceSummaryProps {
  groupId: string;
  readOnly?: boolean;
  group?: Group; // Optional prop for readonly mode
}

export default function BalanceSummary({ groupId, readOnly = false, group: propGroup }: BalanceSummaryProps) {
  const { getGroupSummary, addSettlement, groups } = useApp();
  const { t } = useLanguage();
  const group = propGroup || groups.find((g) => g.id === groupId);
  const [settlingDebt, setSettlingDebt] = useState<Debt | null>(null);

  // Calculate summary - use prop group if provided (readonly mode), otherwise use context
  const summary = propGroup
    ? {
        group: propGroup,
        balances: calculateBalances(propGroup),
        simplifiedDebts: simplifyDebts(calculateBalances(propGroup)),
        totalExpenses: propGroup.expenses.reduce((sum, e) => sum + e.amount, 0),
        expenseCount: propGroup.expenses.length,
      }
    : getGroupSummary(groupId);

  if (!summary || !group) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerson = (personId: string) => {
    return group.members.find((m) => m.id === personId);
  };

  const handleSettle = (debt: Debt) => {
    if (confirm(`Mark payment of ${formatCurrency(debt.amount, group.currencySymbol)} as settled?`)) {
      addSettlement({
        groupId,
        fromPersonId: debt.from,
        toPersonId: debt.to,
        amount: debt.amount,
      });
      setSettlingDebt(null);
    }
  };

  const { balances, simplifiedDebts } = summary;

  // Separate creditors and debtors for display
  const creditors = balances.filter((b) => b.netBalance > 0.01);
  const debtors = balances.filter((b) => b.netBalance < -0.01);
  const settled = balances.filter((b) => Math.abs(b.netBalance) < 0.01);

  return (
    <div className="space-y-6">
      {/* Net Balances */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t.netBalances}</h3>
        <div key={`balances-${balances.length}-${summary.totalExpenses}`} className="grid gap-3 sm:grid-cols-2">
          {/* People who are owed money */}
          {creditors.map((balance) => {
            const person = getPerson(balance.personId);
            if (!person) return null;

            return (
              <motion.div key={balance.personId} variants={listItem}>
                <Card className="border-green-200 dark:border-green-900">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10" style={{ backgroundColor: person.color }}>
                        <AvatarFallback
                          className="text-white font-medium text-xs sm:text-sm"
                          style={{ backgroundColor: person.color }}
                        >
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{person.name}</p>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{t.getsBack}</span>
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                        {formatCurrency(balance.netBalance, group.currencySymbol)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* People who owe money */}
          {debtors.map((balance) => {
            const person = getPerson(balance.personId);
            if (!person) return null;

            return (
              <motion.div key={balance.personId} variants={listItem}>
                <Card className="border-red-200 dark:border-red-900">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10" style={{ backgroundColor: person.color }}>
                        <AvatarFallback
                          className="text-white font-medium text-xs sm:text-sm"
                          style={{ backgroundColor: person.color }}
                        >
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{person.name}</p>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{t.owes}</span>
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                        {formatCurrency(Math.abs(balance.netBalance), group.currencySymbol)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* People who are settled */}
          {settled.map((balance) => {
            const person = getPerson(balance.personId);
            if (!person) return null;

            return (
              <motion.div key={balance.personId} variants={listItem}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10" style={{ backgroundColor: person.color }}>
                        <AvatarFallback
                          className="text-white font-medium text-xs sm:text-sm"
                          style={{ backgroundColor: person.color }}
                        >
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{person.name}</p>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{t.settledUp}</span>
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-muted-foreground whitespace-nowrap">
                        {formatCurrency(0, group.currencySymbol)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Simplified Debts */}
      {simplifiedDebts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t.suggestedPayments}</h3>
          <motion.div
            key={`debts-${simplifiedDebts.length}-${summary.totalExpenses}`}
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {simplifiedDebts.map((debt, index) => {
              const fromPerson = getPerson(debt.from);
              const toPerson = getPerson(debt.to);

              if (!fromPerson || !toPerson) return null;

              return (
                <motion.div key={`${debt.from}-${debt.to}-${index}`} variants={listItem}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Payment info with clear layout */}
                        <div className="flex items-center gap-4 flex-1 w-full">
                          {/* From Person - name with avatar */}
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" style={{ backgroundColor: fromPerson.color }}>
                              <AvatarFallback
                                className="text-white font-medium text-xs sm:text-sm"
                                style={{ backgroundColor: fromPerson.color }}
                              >
                                {getInitials(fromPerson.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{fromPerson.name}</span>
                          </div>

                          {/* Payment amount - centered and prominent */}
                          <div className="flex-1 text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
                              <span className="text-muted-foreground text-xs sm:text-sm">{t.shouldPay}</span>
                              <span className="font-bold text-primary text-lg sm:text-xl whitespace-nowrap">
                                {formatCurrency(debt.amount, group.currencySymbol)}
                              </span>
                              <span className="text-muted-foreground text-xs sm:text-sm">{t.to}</span>
                            </div>
                          </div>

                          {/* To Person - name with avatar */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{toPerson.name}</span>
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" style={{ backgroundColor: toPerson.color }}>
                              <AvatarFallback
                                className="text-white font-medium text-xs sm:text-sm"
                                style={{ backgroundColor: toPerson.color }}
                              >
                                {getInitials(toPerson.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>

                        {/* Settle Button */}
                        {!readOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSettle(debt)}
                            className="flex-shrink-0 w-full sm:w-auto"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t.settle}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* All settled message */}
      {simplifiedDebts.length === 0 && summary.expenseCount > 0 && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">{t.allSettled}</h3>
            <p className="text-muted-foreground">
              {t.allSettledMessage}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
