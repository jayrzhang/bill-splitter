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
import type { Group } from '@/types';
import { GROUP_CATEGORIES, type GroupCategoryId } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EditGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditGroupDialog({ group, open, onOpenChange }: EditGroupDialogProps) {
  const { updateGroup } = useApp();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategoryId>('other');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Category scroll state
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setCategory(group.category || 'other');
      setStartDate(group.startDate ? group.startDate.toISOString().split('T')[0] : '');
      setEndDate(group.endDate ? group.endDate.toISOString().split('T')[0] : '');
    }
  }, [group]);

  // Update category scroll buttons
  useEffect(() => {
    if (!open || !group) return;

    const updateScrollButtons = () => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      }
    };

    // Use requestAnimationFrame to ensure DOM is painted
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
  }, [open, group]);

  if (!group) return null;

  const scrollCategoryLeft = () => {
    categoryScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollCategoryRight = () => {
    categoryScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  const getGroupCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      travel: t.categoryTravel,
      dinner: t.categoryDinner,
      colleagues: t.categoryColleagues,
      roommates: t.categoryRoommates,
      wedding: t.categoryWedding,
      other: t.categoryOther,
    };
    return categoryMap[categoryId] || categoryId;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert(t.endDateMustBeAfterStartDate || 'End date must be after start date');
      return;
    }

    updateGroup(group.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
        <form onSubmit={handleSubmit} className="w-full min-w-0">
          <DialogHeader>
            <DialogTitle>{t.editGroup}</DialogTitle>
            <DialogDescription>
              {t.editGroupMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-visible">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.groupName} *</Label>
              <Input
                id="edit-name"
                placeholder="Weekend Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t.descriptionOptional}</Label>
              <Input
                id="edit-description"
                placeholder="Our adventure to the mountains"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t.groupCategory}</Label>
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
                    {GROUP_CATEGORIES.map((cat) => (
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
                        <span className="text-xs font-medium">{getGroupCategoryName(cat.id)}</span>
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

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">{t.startDateOptional}</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">{t.endDateOptional}</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {t.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
