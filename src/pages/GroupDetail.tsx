import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Group } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Users, Share2, Pencil, Trash2, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/styles/animations';
import AddPersonDialog from '@/components/person/AddPersonDialog';
import PersonList from '@/components/person/PersonList';
import AddExpenseDialog from '@/components/expense/AddExpenseDialog';
import ExpenseList from '@/components/expense/ExpenseList';
import BalanceSummary from '@/components/balance/BalanceSummary';
import ShareGroupDialog from '@/components/group/ShareGroupDialog';
import EditGroupDialog from '@/components/group/EditGroupDialog';
import { format } from 'date-fns';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readonly') === 'true';
  const { groups, deleteGroup } = useApp();
  const { t } = useLanguage();

  // State for read-only group loaded from sessionStorage
  const [readOnlyGroup, setReadOnlyGroup] = useState<Group | null>(null);

  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);

  // Load group from sessionStorage if in read-only mode
  useEffect(() => {
    if (isReadOnly && groupId) {
      const storedData = sessionStorage.getItem(`readonly_group_${groupId}`);
      if (storedData) {
        try {
          const parsedGroup: Group = JSON.parse(storedData);
          // Hydrate dates
          parsedGroup.createdAt = new Date(parsedGroup.createdAt);
          parsedGroup.updatedAt = new Date(parsedGroup.updatedAt);
          if (parsedGroup.startDate) parsedGroup.startDate = new Date(parsedGroup.startDate);
          if (parsedGroup.endDate) parsedGroup.endDate = new Date(parsedGroup.endDate);
          parsedGroup.members = parsedGroup.members.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }));
          parsedGroup.expenses = parsedGroup.expenses.map((e: any) => ({
            ...e,
            date: new Date(e.date),
            createdAt: new Date(e.createdAt),
          }));
          parsedGroup.settlements = parsedGroup.settlements.map((s: any) => ({
            ...s,
            settledAt: new Date(s.settledAt),
          }));
          setReadOnlyGroup(parsedGroup);
        } catch (error) {
          console.error('Failed to parse read-only group:', error);
        }
      }
    }
  }, [isReadOnly, groupId]);

  // Use read-only group if available, otherwise use group from context
  const group = isReadOnly ? readOnlyGroup : groups.find(g => g.id === groupId);

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
        {/* Read-only Banner */}
        {isReadOnly && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {t.readOnlyView}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t.readOnlyMessage}
                </p>
              </div>
            </div>
          </div>
        )}

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
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditGroupDialogOpen(true)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
              {(group.startDate || group.endDate) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {group.startDate && format(group.startDate, 'MMMM d, yyyy')}
                    {group.startDate && group.endDate && ' - '}
                    {group.endDate && format(group.endDate, 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            {!isReadOnly && (
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
            )}
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
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddPersonDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </Button>
            )}
          </div>

          {hasMembers ? (
            <PersonList groupId={group.id} readOnly={isReadOnly} />
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-3">
                No members yet. Add people to start splitting expenses.
              </p>
              {!isReadOnly && (
                <Button onClick={() => setIsAddPersonDialogOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              )}
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

            {!isReadOnly && canAddExpense && (
              <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            )}
          </div>

          <TabsContent value="expenses">
            {canAddExpense ? (
              <ExpenseList groupId={group.id} readOnly={isReadOnly} group={group} />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-3">
                  Add at least 2 members to start tracking expenses
                </p>
                {!isReadOnly && (
                  <Button onClick={() => setIsAddPersonDialogOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Members
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances">
            {canAddExpense ? (
              <BalanceSummary groupId={group.id} readOnly={isReadOnly} group={group} />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  {isReadOnly
                    ? 'No balances to display yet'
                    : 'Add members and expenses to see balances'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs - Only render in non-readonly mode */}
      {!isReadOnly && (
        <>
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
        </>
      )}
    </motion.div>
  );
}
