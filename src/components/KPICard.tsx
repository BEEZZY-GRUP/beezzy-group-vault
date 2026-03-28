import { formatCurrency } from '@/lib/formatters';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
  format?: 'currency' | 'number';
  accent?: boolean;
  valueColor?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'warn';
  delay?: number;
}

export function KPICard({ title, value, format = 'currency', accent, valueColor, delta, deltaType = 'up', delay = 0 }: KPICardProps) {
  const deltaColors = { up: 'text-success', down: 'text-destructive', warn: 'text-warning' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className="glass-card-hover p-4"
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2">{title}</div>
      <div
        className={`font-display text-xl font-semibold tracking-[-0.02em] mb-1.5 ${accent ? 'accent-text' : ''}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {format === 'currency' ? formatCurrency(value) : value.toLocaleString('pt-BR')}
      </div>
      {delta && (
        <div className={`text-[11px] flex items-center gap-1 ${deltaColors[deltaType]}`}>
          {delta}
        </div>
      )}
    </motion.div>
  );
}
