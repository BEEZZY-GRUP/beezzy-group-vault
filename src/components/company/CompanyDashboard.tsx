import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, Receipt, ShoppingCart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { DateRange, isInRange } from '@/components/DateRangeFilter';

const CATEGORY_COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#6366F1'];

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

interface Props {
  companyId: CompanyId;
  dateRange: DateRange;
}

export function CompanyDashboard({ companyId, dateRange }: Props) {
  const { getCompanyExpenses, getCompanyRevenues, getCompanySettings } = useData();
  const allExpenses = getCompanyExpenses(companyId);
  const allRevenues = getCompanyRevenues(companyId);
  const settings = getCompanySettings(companyId);

  const expenses = useMemo(() => allExpenses.filter(e => isInRange(e.dueDate, dateRange)), [allExpenses, dateRange]);
  const revenues = useMemo(() => allRevenues.filter(r => isInRange(r.saleDate, dateRange)), [allRevenues, dateRange]);

  const totalRevenue = revenues.reduce((s, r) => s + r.grossValue, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const totalTaxes = revenues.reduce((s, r) => s + r.taxAmount, 0);
  const totalSales = revenues.reduce((s, r) => s + r.quantity, 0);

  // Build monthly buckets between from and to
  const monthlyBuckets = useMemo(() => {
    const buckets: { key: string; label: string; month: number; year: number }[] = [];
    const d = new Date(dateRange.from);
    while (d <= dateRange.to) {
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        month: d.getMonth(),
        year: d.getFullYear(),
      });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }, [dateRange]);

  const trendData = useMemo(() =>
    monthlyBuckets.map(b => ({
      name: b.label,
      receita: allRevenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === b.month && rd.getFullYear() === b.year; }).reduce((s, r) => s + r.grossValue, 0),
      despesa: allExpenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === b.month && ed.getFullYear() === b.year; }).reduce((s, e) => s + e.value, 0),
    })),
    [allRevenues, allExpenses, monthlyBuckets]
  );

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.value; });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalCategoryValue = categoryData.reduce((s, c) => s + c.value, 0);

  const cashFlowData = useMemo(() =>
    monthlyBuckets.map(b => {
      const rev = allRevenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === b.month && rd.getFullYear() === b.year; }).reduce((s, r) => s + r.grossValue, 0);
      const exp = allExpenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === b.month && ed.getFullYear() === b.year; }).reduce((s, e) => s + e.value, 0);
      const tax = allRevenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === b.month && rd.getFullYear() === b.year; }).reduce((s, r) => s + r.taxAmount, 0);
      return { name: b.label, entrada: rev, saida: exp, imposto: tax, saldo: rev - exp - tax };
    }),
    [allRevenues, allExpenses, monthlyBuckets]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard title="Faturamento" value={totalRevenue} icon={DollarSign} delay={0} />
        <KPICard title="Despesas" value={totalExpenses} icon={TrendingDown} delay={1} />
        <KPICard title="Fluxo de Caixa" value={totalRevenue - totalExpenses} icon={ArrowRightLeft} delay={2} />
        <KPICard title="Impostos" value={totalTaxes} icon={Receipt} trend={`Alíquota: ${settings.taxRate}%`} delay={3} />
        <KPICard title="Vendas" value={totalSales} icon={ShoppingCart} format="number" delay={4} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita vs Despesa</h3>
          <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">{dateRange.label}</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 15% 55%)' }} />
            <Area type="monotone" dataKey="receita" name="Receita" stroke="#10B981" strokeWidth={2.5} fill="url(#gradReceita)" dot={false} />
            <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#EF4444" strokeWidth={2} fill="url(#gradDespesa)" dot={false} strokeDasharray="6 3" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Despesas por Categoria</h3>
          <div className="flex items-center gap-6">
            <div className="w-[200px] h-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={2} stroke="hsl(240 6% 7%)">
                    {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
              {categoryData.map((cat, i) => {
                const pct = totalCategoryValue > 0 ? ((cat.value / totalCategoryValue) * 100).toFixed(1) : '0';
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-xs text-muted-foreground truncate flex-1">{cat.name}</span>
                    <span className="text-xs font-mono font-medium text-foreground/80 shrink-0">{pct}%</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{formatCurrency(cat.value)}</span>
                  </div>
                );
              })}
              {categoryData.length === 0 && <p className="text-xs text-muted-foreground/50">Sem despesas no período</p>}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashFlowData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '10px', color: 'hsl(215 15% 55%)' }} />
              <Bar dataKey="entrada" name="Entrada" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="saida" name="Saída" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="imposto" name="Imposto" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/20">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Entrada</p>
              <p className="text-sm font-bold text-success font-mono">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex-1 text-center border-x border-border/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Saída</p>
              <p className="text-sm font-bold text-destructive font-mono">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Saldo</p>
              <p className={`text-sm font-bold font-mono ${totalRevenue - totalExpenses - totalTaxes >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(totalRevenue - totalExpenses - totalTaxes)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
