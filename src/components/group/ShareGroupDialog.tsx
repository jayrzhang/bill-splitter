import { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  const exportData = JSON.stringify(group, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Group</DialogTitle>
          <DialogDescription>
            Copy this group data and share it with others. They can import it to see the same expenses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg max-h-64 overflow-auto">
            <pre className="text-xs text-foreground whitespace-pre-wrap break-all">
              {exportData}
            </pre>
          </div>

          <Button onClick={handleCopy} className="w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Group Data
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Note:</strong> This app uses local storage, so data is only saved on your device.</p>
            <p>
              To share with others, copy the data above and send it via your preferred method
              (email, messaging app, etc.). Recipients can import it using the Import feature.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
