import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

const presets = [
  { label: 'Este mês', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: 'Mês passado', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth() - 1, 1), to: new Date(n.getFullYear(), n.getMonth(), 0) }; } },
  { label: 'Últimos 3 meses', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth() - 2, 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: 'Últimos 6 meses', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth() - 5, 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: 'Este ano', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), 0, 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: 'Ano passado', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear() - 1, 0, 1), to: new Date(n.getFullYear() - 1, 11, 31) }; } },
];

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handlePreset = (preset: typeof presets[0]) => {
    const { from, to } = preset.getValue();
    onChange({ from, to, label: preset.label });
    setOpen(false);
  };

  const handleCustom = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom + 'T00:00:00');
      const to = new Date(customTo + 'T23:59:59');
      if (from <= to) {
        onChange({
          from, to,
          label: `${from.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} — ${to.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        });
        setOpen(false);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 h-9 px-3 bg-secondary/50 border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all',
            className
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="truncate max-w-[180px]">{value.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-card border-border/50" align="start">
        {/* Presets */}
        <div className="p-2 space-y-0.5">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold px-2 py-1.5">Períodos</p>
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                value.label === preset.label
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="border-t border-border/30 p-3 space-y-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold">Personalizado</p>
          <div className="flex gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="flex-1 h-9 px-2 rounded-md bg-secondary/50 border border-border/50 text-sm text-foreground focus:border-primary/50 focus:outline-none"
            />
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="flex-1 h-9 px-2 rounded-md bg-secondary/50 border border-border/50 text-sm text-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={handleCustom} disabled={!customFrom || !customTo} className="w-full text-xs">
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getDefaultDateRange(): DateRange {
  const n = new Date();
  return {
    from: new Date(n.getFullYear(), n.getMonth(), 1),
    to: new Date(n.getFullYear(), n.getMonth() + 1, 0),
    label: 'Este mês',
  };
}

export function isInRange(dateStr: string, range: DateRange): boolean {
  const d = new Date(dateStr);
  return d >= range.from && d <= range.to;
}
