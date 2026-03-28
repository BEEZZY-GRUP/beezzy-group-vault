import { useState } from 'react';
import { toast } from 'sonner';

export interface DateFilterState {
  from: Date;
  to: Date;
  label: string;
  preset: string;
}

const PRESETS: { key: string; label: string; getRange: () => { from: Date; to: Date; label: string } }[] = [
  {
    key: '7d', label: '7 dias',
    getRange: () => {
      const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 7);
      return { from, to, label: 'Últimos 7 dias' };
    },
  },
  {
    key: '30d', label: '30 dias',
    getRange: () => {
      const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 30);
      return { from, to, label: 'Últimos 30 dias' };
    },
  },
  {
    key: '3m', label: '3 meses',
    getRange: () => {
      const to = new Date(); const from = new Date(); from.setMonth(from.getMonth() - 3);
      return { from, to, label: 'Últimos 3 meses' };
    },
  },
  {
    key: '6m', label: '6 meses',
    getRange: () => {
      const to = new Date(); const from = new Date(); from.setMonth(from.getMonth() - 6);
      return { from, to, label: 'Últimos 6 meses' };
    },
  },
  {
    key: '1y', label: '12 meses',
    getRange: () => {
      const to = new Date(); const from = new Date(); from.setFullYear(from.getFullYear() - 1);
      return { from, to, label: 'Últimos 12 meses' };
    },
  },
  {
    key: 'all', label: 'Tudo',
    getRange: () => {
      return { from: new Date(2020, 0, 1), to: new Date(), label: 'Todo o período' };
    },
  },
];

export function getDefaultFilterState(): DateFilterState {
  const preset = PRESETS.find(p => p.key === '6m')!;
  const range = preset.getRange();
  return { ...range, preset: '6m' };
}

export function isInDateRange(dateStr: string, state: DateFilterState): boolean {
  const d = new Date(dateStr);
  return d >= state.from && d <= state.to;
}

function formatDateInput(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatLabel(from: Date, to: Date) {
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  return `${fmt(from)} — ${fmt(to)}`;
}

interface Props {
  value: DateFilterState;
  onChange: (v: DateFilterState) => void;
}

export function DateFilterBar({ value, onChange }: Props) {
  const [customFrom, setCustomFrom] = useState(formatDateInput(value.from));
  const [customTo, setCustomTo] = useState(formatDateInput(value.to));

  const selectPreset = (key: string) => {
    const preset = PRESETS.find(p => p.key === key)!;
    const range = preset.getRange();
    onChange({ ...range, preset: key });
    setCustomFrom(formatDateInput(range.from));
    setCustomTo(formatDateInput(range.to));
  };

  const applyCustom = () => {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
      toast.error('Intervalo de datas inválido');
      return;
    }
    onChange({ from, to, label: formatLabel(from, to), preset: 'custom' });
  };

  return (
    <div className="flex items-center gap-2 px-7 py-2.5 bg-[hsl(0_0%_2.7%)] border-b border-border shrink-0 flex-wrap">
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.08em] mr-1 font-medium">
        Período
      </span>

      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => selectPreset(p.key)}
            className={`px-[11px] py-1 rounded-[5px] text-[11px] transition-all ${
              value.preset === p.key
                ? 'accent-gradient text-black font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.04)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-[18px] bg-input mx-1" />

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground/60">De</span>
        <input
          type="date"
          value={customFrom}
          onChange={e => setCustomFrom(e.target.value)}
          className="bg-[hsl(0_0%_100%/0.04)] border border-input rounded-[5px] px-2.5 py-1 text-[11px] text-foreground outline-none focus:border-primary transition-colors [color-scheme:dark]"
        />
        <span className="text-[11px] text-muted-foreground/60">até</span>
        <input
          type="date"
          value={customTo}
          onChange={e => setCustomTo(e.target.value)}
          className="bg-[hsl(0_0%_100%/0.04)] border border-input rounded-[5px] px-2.5 py-1 text-[11px] text-foreground outline-none focus:border-primary transition-colors [color-scheme:dark]"
        />
        <button
          onClick={applyCustom}
          className="px-3 py-1 rounded-[5px] text-[11px] font-medium border border-primary text-primary bg-primary/[0.12] hover:bg-primary/20 transition-colors"
        >
          Aplicar
        </button>
      </div>

      <div className="ml-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
        Exibindo: <strong className="text-primary font-medium">{value.label}</strong>
      </div>
    </div>
  );
}
