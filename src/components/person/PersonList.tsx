import { useApp } from '@/context/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { listItem } from '@/styles/animations';

interface PersonListProps {
  groupId: string;
  readOnly?: boolean;
}

export default function PersonList({ groupId, readOnly = false }: PersonListProps) {
  const { groups, removePerson } = useApp();
  const group = groups.find((g) => g.id === groupId);

  if (!group || group.members.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {group.members.map((person) => (
        <motion.div
          key={person.id}
          variants={listItem}
          initial="initial"
          animate="animate"
          exit="exit"
          className="group relative"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50 border border-border">
            <Avatar className="h-8 w-8" style={{ backgroundColor: person.color }}>
              <AvatarFallback
                className="text-white font-medium text-xs"
                style={{ backgroundColor: person.color }}
              >
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{person.name}</span>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePerson(groupId, person.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
