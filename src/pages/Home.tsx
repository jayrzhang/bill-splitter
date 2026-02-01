import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/styles/animations';
import { formatDate, formatCurrency } from '@/lib/utils';
import CreateGroupDialog from '@/components/group/CreateGroupDialog';

export default function Home() {
  const { groups, setCurrentGroup, getGroupSummary } = useApp();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleGroupClick = (groupId: string) => {
    setCurrentGroup(groupId);
    // Navigation will be handled by router later
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Bill Splitter</h1>
          <p className="text-muted-foreground">
            Split expenses and settle debts with friends
          </p>
        </motion.div>

        {/* Create Group Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Group
          </Button>
        </motion.div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <motion.div
            className="text-center py-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first group to start splitting expenses
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {groups.map((group) => {
              const summary = getGroupSummary(group.id);
              return (
                <motion.div key={group.id} variants={fadeInUp}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{group.members.length} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          <span>{summary?.expenseCount || 0} expenses</span>
                        </div>
                        {summary && summary.totalExpenses > 0 && (
                          <div className="ml-auto font-medium text-foreground">
                            {formatCurrency(summary.totalExpenses, group.currencySymbol)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Updated {formatDate(group.updatedAt)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
