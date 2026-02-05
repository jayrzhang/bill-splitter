import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { type Language, languageNames } from '@/i18n/translations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages: Language[] = ['en', 'ja', 'zh'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[language]}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>{t.language}</DialogTitle>
          <DialogDescription>
            Choose your preferred language
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {languages.map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'default' : 'outline'}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className="justify-start"
            >
              {languageNames[lang]}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
