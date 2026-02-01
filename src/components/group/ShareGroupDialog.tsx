import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import type { Group } from '@/types';

interface ShareGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareGroupDialog({ group, open, onOpenChange }: ShareGroupDialogProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  // Create shareable URL with base64-encoded group STRUCTURE ONLY (no expenses)
  // This keeps URLs short and makes sense for collaboration: create group together, then add expenses
  const groupStructure = {
    id: group.id,
    name: group.name,
    description: group.description,
    currency: group.currency,
    currencySymbol: group.currencySymbol,
    members: group.members,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    // Intentionally exclude expenses and settlements to keep URL short
    expenses: [],
    settlements: []
  };
  const groupData = JSON.stringify(groupStructure);
  const encodedData = btoa(encodeURIComponent(groupData));
  const shareUrl = `${window.location.origin}/?share=${encodedData}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.shareGroup}</DialogTitle>
          <DialogDescription>
            {t.shareGroupDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-foreground break-all">
              {shareUrl}
            </p>
          </div>

          <Button onClick={handleCopy} className="w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t.copiedToClipboard}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {t.copyShareLink}
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>{t.howItWorks}</strong> {t.shareNote1}</p>
            <p>
              {t.shareNote2}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
