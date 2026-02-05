import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Receipt, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/styles/animations';
import { formatDate, formatCurrency } from '@/lib/utils';
import CreateGroupDialog from '@/components/group/CreateGroupDialog';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { GROUP_CATEGORIES } from '@/lib/constants';
import { format } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const { groups, getGroupSummary, deleteGroup } = useApp();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getCategoryDetails = (categoryId: string | undefined) => {
    if (!categoryId) return null;
    return GROUP_CATEGORIES.find((cat) => cat.id === categoryId);
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string, groupName: string) => {
    e.stopPropagation();
    if (confirm(`Delete "${groupName}"? This will permanently remove all expenses and data.`)) {
      deleteGroup(groupId);
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/group/${groupId}`);
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{t.appTitle}</h1>
              <p className="text-muted-foreground">{t.appTagline}</p>
            </div>
            <LanguageSelector />
          </div>
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
            {t.newGroup}
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
            <h3 className="text-lg font-semibold mb-2">{t.noGroupsYet}</h3>
            <p className="text-muted-foreground mb-6">
              {t.noGroupsMessage}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.createGroup}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={`groups-${groups.length}`}
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
                    className="group cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle>{group.name}</CardTitle>
                            {group.category && (() => {
                              const categoryDetails = getCategoryDetails(group.category);
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
                                </span>
                              );
                            })()}
                          </div>
                          {group.description && (
                            <CardDescription>{group.description}</CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={(e) => handleDeleteGroup(e, group.id, group.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(group.startDate || group.endDate) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {group.startDate && format(group.startDate, 'MMM d')}
                            {group.startDate && group.endDate && ' - '}
                            {group.endDate && format(group.endDate, group.startDate ? 'MMM d, yyyy' : 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{group.members.length} {t.members}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          <span>{summary?.expenseCount || 0} {t.expenses}</span>
                        </div>
                        {summary && summary.totalExpenses > 0 && (
                          <div className="ml-auto font-medium text-foreground">
                            {formatCurrency(summary.totalExpenses, group.currencySymbol)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t.updated} {formatDate(group.updatedAt)}
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
