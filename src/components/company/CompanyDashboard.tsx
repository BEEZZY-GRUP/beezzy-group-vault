import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, COMPANY_INFO } from '@/lib/types';
import { KPICard } from '@/components/KPICard';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DateFilterState, isInDateRange } from '@/components/DateFilterBar';

const chartTooltipStyle = {
  contentStyle: {
    background: '#111', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', color: '#fff', fontSize: '12px',
  },
};
const axisStyle = { fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'DM Sans' };

interface Props {
  companyId: CompanyId;
  dateFilter: DateFilterState;
}

export function CompanyDashboard({ companyId, dateFilter }: Props) {
  const { getCompanyExpenses, getCompanyRevenues, getCompanySettings } = useData();
  const allExpenses = getCompanyExpenses(companyId);
  const allRevenues = getCompanyRevenues(companyId);
  const settings = getCompanySettings(companyId);

  const expenses = useMemo(() => allExpenses.filter(e => isInDateRange(e.dueDate, dateFilter)), [allExpenses, dateFilter]);
  const revenues = useMemo(() => allRevenues.filter(r => isInDateRange(r.saleDate, dateFilter)), [allRevenues, dateFilter]);

  const totalRevenue = revenues.reduce((s, r) => s + r.grossValue, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const totalTaxes = Math.round(totalRevenue * (settings.taxRate / 100));
  const resultado = totalRevenue - totalTaxes - totalExpenses;

  const monthlyBuckets = useMemo(() => {
    const buckets: { label: string; month: number; year: number }[] = [];
    const d = new Date(dateFilter.from);
    while (d <= dateFilter.to) {
      buckets.push({ label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), month: d.getMonth(), year: d.getFullYear() });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }, [dateFilter]);

  const fatBarData = useMemo(() =>
    monthlyBuckets.map((b, i) => ({
      name: b.label,
      value: allRevenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === b.month && rd.getFullYear() === b.year; }).reduce((s, r) => s + r.grossValue, 0),
      isLast: i === monthlyBuckets.length - 1,
    })),
    [allRevenues, monthlyBuckets]
  );

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.value; });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const CAT_COLORS = ['rgba(245,197,24,0.8)', 'rgba(245,197,24,0.55)', 'rgba(245,197,24,0.38)', 'rgba(245,197,24,0.25)', 'rgba(245,197,24,0.15)'];

  const recentExpenses = useMemo(() =>
    expenses.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).slice(0, 5),
    [expenses]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Faturamento do Mês" value={totalRevenue} accent delta="▲ +12% vs mês ant." deltaType="up" delay={0} />
        <KPICard title="Despesas do Mês" value={totalExpenses} delta="▲ +6% vs mês ant." deltaType="down" delay={1} />
        <KPICard title="Resultado Líquido" value={resultado} valueColor="hsl(142 72% 39%)" delta="▲ +18% vs mês ant." deltaType="up" delay={2} />
        <KPICard title="Imposto Calculado" value={totalTaxes} delta={`Alíquota: ${settings.taxRate}%`} deltaType="warn" delay={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Faturamento Mensal</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fatBarData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {fatBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.isLast ? 'rgba(245,197,24,0.85)' : 'rgba(245,197,24,0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Despesas por Categoria</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <span className="text-[13px] font-medium">Lançamentos Recentes</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[rgba(255,255,255,0.02)]">
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Descrição</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Categoria</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Valor</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Vencimento</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentExpenses.map(e => (
              <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-[11px_18px] text-xs">{e.description}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{e.category}</td>
                <td className="p-[11px_18px] text-xs">{formatCurrency(e.value)}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{formatDate(e.dueDate)}</td>
                <td className="p-[11px_18px] text-xs">
                  <span className={`status-${e.status} inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded`}>
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
