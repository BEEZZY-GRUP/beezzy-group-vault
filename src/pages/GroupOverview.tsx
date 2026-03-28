import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { KPICard } from '@/components/KPICard';
import { COMPANY_INFO, CompanyId } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, ShoppingCart, Receipt } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { DateRangeFilter, DateRange, getDefaultDateRange, isInRange } from '@/components/DateRangeFilter';

const COLORS = [COMPANY_INFO.beezzy.color, COMPANY_INFO.palpita.color, COMPANY_INFO.starmind.color];

const chartTooltipStyle = {
  contentStyle: {
    background: 'hsl(240 6% 10%)',
    border: '1px solid hsl(240 5% 18%)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
};

const axisStyle = { fill: 'hsl(215 15% 40%)', fontSize: 11, fontFamily: 'Inter' };

export default function GroupOverview() {
  const { expenses, revenues } = useData();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

  const filteredRevenues = useMemo(() => revenues.filter(r => isInRange(r.saleDate, dateRange)), [revenues, dateRange]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isInRange(e.dueDate, dateRange)), [expenses, dateRange]);

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.grossValue, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.value, 0);
  const totalSales = filteredRevenues.reduce((sum, r) => sum + r.quantity, 0);
  const totalTaxes = filteredRevenues.reduce((sum, r) => sum + r.taxAmount, 0);

  const monthlyBuckets = useMemo(() => {
    const buckets: { key: string; label: string; month: number; year: number }[] = [];
    const d = new Date(dateRange.from);
    while (d <= dateRange.to) {
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), month: d.getMonth(), year: d.getFullYear() });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }, [dateRange]);

  const lineData = useMemo(() =>
    monthlyBuckets.map(b => {
      const row: any = { name: b.label };
      (['beezzy', 'palpita', 'starmind'] as CompanyId[]).forEach(c => {
        row[c] = revenues.filter(r => r.company === c && new Date(r.saleDate).getMonth() === b.month && new Date(r.saleDate).getFullYear() === b.year).reduce((s, r) => s + r.grossValue, 0);
      });
      return row;
    }),
    [revenues, monthlyBuckets]
  );

  const barData = useMemo(() => {
    const companies: CompanyId[] = ['beezzy', 'palpita', 'starmind'];
    return companies.map(c => ({
      name: COMPANY_INFO[c].name,
      value: filteredExpenses.filter(e => e.company === c).reduce((s, e) => s + e.value, 0),
    }));
  }, [filteredExpenses]);

  const pieData = useMemo(() => {
    const companies: CompanyId[] = ['beezzy', 'palpita', 'starmind'];
    return companies.map(c => ({
      name: COMPANY_INFO[c].name,
      value: filteredRevenues.filter(r => r.company === c).reduce((s, r) => s + r.grossValue, 0),
    }));
  }, [filteredRevenues]);

  const contasPagar = useMemo(() =>
    filteredExpenses.filter(e => e.status !== 'pago').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [filteredExpenses]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral do Grupo</h1>
          <p className="text-sm text-muted-foreground mt-1">Consolidação financeira de todas as empresas</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Faturamento Total" value={totalRevenue} icon={DollarSign} delay={0} />
        <KPICard title="Despesas Totais" value={totalExpenses} icon={TrendingDown} delay={1} />
        <KPICard title="Fluxo de Caixa" value={totalRevenue - totalExpenses} icon={ArrowRightLeft} delay={2} />
        <KPICard title="Total de Vendas" value={totalSales} icon={ShoppingCart} format="number" delay={3} />
        <KPICard title="Impostos a Pagar" value={totalTaxes} icon={Receipt} delay={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita por Empresa</h3>
            <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">{dateRange.label}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 15% 55%)' }} />
              <Line type="monotone" dataKey="beezzy" stroke={COLORS[0]} name="Beezzy" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="palpita" stroke={COLORS[1]} name="Palpita.io" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="starmind" stroke={COLORS[2]} name="Starmind" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Despesas por Empresa</h3>
            <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">{dateRange.label}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" name="Despesas" radius={[8, 8, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Participação no Faturamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" strokeWidth={0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Contas a Pagar</h3>
            <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">{contasPagar.length} pendentes</span>
          </div>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm">
                <tr className="border-b border-border/30 text-muted-foreground/70 text-left">
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Empresa</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Descrição</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Valor</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Vencimento</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {contasPagar.map(e => (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <span>{COMPANY_INFO[e.company].icon}</span>
                        <span className="text-foreground/80 font-medium">{COMPANY_INFO[e.company].name}</span>
                      </span>
                    </td>
                    <td className="py-3 text-foreground/70">{e.description}</td>
                    <td className="py-3 font-mono font-medium text-foreground/90">{formatCurrency(e.value)}</td>
                    <td className="py-3 text-foreground/60">{formatDate(e.dueDate)}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={`status-${e.status} border-0 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md`}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
