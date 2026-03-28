import { formatCurrency } from '@/lib/formatters';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'currency' | 'number';
  trend?: string;
  color?: string;
}

export function KPICard({ title, value, icon: Icon, format = 'currency', trend, color }: KPICardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {format === 'currency' ? formatCurrency(value) : value.toLocaleString('pt-BR')}
          </p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className="p-2 rounded-lg bg-primary/10" style={color ? { backgroundColor: `${color}20` } : undefined}>
          <Icon className="h-5 w-5 text-primary" style={color ? { color } : undefined} />
        </div>
      </div>
    </div>
  );
}
