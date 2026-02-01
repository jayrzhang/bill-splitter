import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/styles/animations';
import AddPersonDialog from '@/components/person/AddPersonDialog';
import PersonList from '@/components/person/PersonList';
import AddExpenseDialog from '@/components/expense/AddExpenseDialog';
import ExpenseList from '@/components/expense/ExpenseList';
import BalanceSummary from '@/components/balance/BalanceSummary';

export default function GroupDetail() {
  const { getCurrentGroup, setCurrentGroup } = useApp();
  const group = getCurrentGroup();
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No group selected</h2>
          <p className="text-muted-foreground mb-4">Please select a group to continue</p>
          <Button onClick={() => setCurrentGroup(null)}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const hasMembers = group.members.length > 0;
  const canAddExpense = group.members.length >= 2;

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentGroup(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Members ({group.members.length})
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddPersonDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </div>

          {hasMembers ? (
            <PersonList groupId={group.id} />
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-3">
                No members yet. Add people to start splitting expenses.
              </p>
              <Button onClick={() => setIsAddPersonDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Member
              </Button>
            </div>
          )}
        </div>

        {/* Tabs for Expenses and Balances */}
        <Tabs defaultValue="expenses" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
            </TabsList>

            {canAddExpense && (
              <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            )}
          </div>

          <TabsContent value="expenses">
            {canAddExpense ? (
              <ExpenseList groupId={group.id} />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-3">
                  Add at least 2 members to start tracking expenses
                </p>
                <Button onClick={() => setIsAddPersonDialogOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Members
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances">
            {canAddExpense ? (
              <BalanceSummary groupId={group.id} />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  Add members and expenses to see balances
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddPersonDialog
        groupId={group.id}
        open={isAddPersonDialogOpen}
        onOpenChange={setIsAddPersonDialogOpen}
      />

      {canAddExpense && (
        <AddExpenseDialog
          groupId={group.id}
          open={isAddExpenseDialogOpen}
          onOpenChange={setIsAddExpenseDialogOpen}
        />
      )}
    </motion.div>
  );
}
