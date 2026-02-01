import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Users, Share2, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/styles/animations';
import AddPersonDialog from '@/components/person/AddPersonDialog';
import PersonList from '@/components/person/PersonList';
import AddExpenseDialog from '@/components/expense/AddExpenseDialog';
import ExpenseList from '@/components/expense/ExpenseList';
import BalanceSummary from '@/components/balance/BalanceSummary';
import ShareGroupDialog from '@/components/group/ShareGroupDialog';
import EditGroupDialog from '@/components/group/EditGroupDialog';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, deleteGroup } = useApp();
  const group = groups.find(g => g.id === groupId);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-3">Group Not Found</h2>
          <p className="text-muted-foreground mb-2">
            This group doesn't exist in your browser's storage.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            <strong>Why?</strong> This app uses local storage - data only exists on the device where it was created.
            If you received a share link, it only contains the group structure (name, members).
            You'll need to create expenses together.
          </p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const handleDeleteGroup = () => {
    if (confirm(`Delete "${group.name}"? This will permanently remove all expenses and data.`)) {
      deleteGroup(group.id);
      navigate('/');
    }
  };

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
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditGroupDialogOpen(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteGroup}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
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

      <ShareGroupDialog
        group={group}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />

      <EditGroupDialog
        group={group}
        open={isEditGroupDialogOpen}
        onOpenChange={setIsEditGroupDialogOpen}
      />
    </motion.div>
  );
}
