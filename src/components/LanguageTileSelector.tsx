import { Check, Globe } from 'lucide-react';
import { LANGUAGES } from '@/constants/languages';

interface LanguageTileSelectorProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export const LanguageTileSelector = ({ value, onChange, compact = false }: LanguageTileSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Globe className="h-4 w-4" />
        <span>Select Language</span>
      </div>
      <div className={`grid ${compact ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-1.5`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => onChange(lang.value)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border-2 text-xs font-medium transition-all text-left ${
              value === lang.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 bg-white/50 text-foreground hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            {value === lang.value && (
              <Check className="h-3 w-3 shrink-0 text-primary" />
            )}
            <span className="truncate">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
