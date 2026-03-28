import { formatCurrency } from '@/lib/formatters';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'currency' | 'number';
  trend?: string;
  color?: string;
  delay?: number;
}

export function KPICard({ title, value, icon: Icon, format = 'currency', trend, color, delay = 0 }: KPICardProps) {
  const isPositive = value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-hover p-5 relative overflow-hidden group"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {format === 'currency' ? formatCurrency(value) : value.toLocaleString('pt-BR')}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <p className="text-xs text-muted-foreground">{trend}</p>
            </div>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shrink-0"
          style={color ? { backgroundColor: `${color}15`, borderColor: `${color}20` } : undefined}
        >
          <Icon className="h-5 w-5 text-primary" style={color ? { color } : undefined} />
        </div>
      </div>
    </motion.div>
  );
}
