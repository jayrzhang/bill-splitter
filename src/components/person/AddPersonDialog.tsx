import { useState } from 'react';
import { useApp } from '@/context/AppContext';
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

interface AddPersonDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPersonDialog({ groupId, open, onOpenChange }: AddPersonDialogProps) {
  const { addPerson } = useApp();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPerson(groupId, name.trim());
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>
              Add a new member to this group
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="person-name">Name *</Label>
              <Input
                id="person-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
