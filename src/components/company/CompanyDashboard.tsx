import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, Receipt, ShoppingCart } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { motion } from 'framer-motion';

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

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="hsl(215 15% 60%)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontFamily="Inter">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export function CompanyDashboard({ companyId }: { companyId: CompanyId }) {
  const { getCompanyExpenses, getCompanyRevenues, getCompanySettings } = useData();
  const expenses = getCompanyExpenses(companyId);
  const revenues = getCompanyRevenues(companyId);
  const settings = getCompanySettings(companyId);

  const now = new Date();
  const isCurrentMonth = (d: string) => {
    const date = new Date(d);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const monthRevenue = revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((s, r) => s + r.grossValue, 0);
  const monthExpenses = expenses.filter(e => isCurrentMonth(e.dueDate)).reduce((s, e) => s + e.value, 0);
  const monthTaxes = revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((s, r) => s + r.taxAmount, 0);
  const monthSales = revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((s, r) => s + r.quantity, 0);

  const trendData = useMemo(() => {
    const data: { name: string; receita: number; despesa: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const rev = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.grossValue, 0);
      const exp = expenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === m && ed.getFullYear() === y; }).reduce((s, e) => s + e.value, 0);
      data.push({ name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), receita: rev, despesa: exp });
    }
    return data;
  }, [revenues, expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.filter(e => isCurrentMonth(e.dueDate)).forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.value;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalCategoryValue = categoryData.reduce((s, c) => s + c.value, 0);

  // Stacked waterfall: accumulative bars
  const cashFlowData = useMemo(() => {
    const data: { name: string; entrada: number; saida: number; imposto: number; saldo: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const rev = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.grossValue, 0);
      const exp = expenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === m && ed.getFullYear() === y; }).reduce((s, e) => s + e.value, 0);
      const tax = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.taxAmount, 0);
      data.push({ name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), entrada: rev, saida: exp, imposto: tax, saldo: rev - exp - tax });
    }
    return data;
  }, [revenues, expenses]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard title="Faturamento do Mês" value={monthRevenue} icon={DollarSign} delay={0} />
        <KPICard title="Despesas do Mês" value={monthExpenses} icon={TrendingDown} delay={1} />
        <KPICard title="Fluxo de Caixa" value={monthRevenue - monthExpenses} icon={ArrowRightLeft} delay={2} />
        <KPICard title="Impostos Calculados" value={monthTaxes} icon={Receipt} trend={`Alíquota: ${settings.taxRate}%`} delay={3} />
        <KPICard title="Vendas" value={monthSales} icon={ShoppingCart} format="number" delay={4} />
      </div>

      {/* Revenue trend - Area chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita vs Despesa Mensal</h3>
          <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">6 meses</span>
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
        {/* Category donut with legend */}
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
            {/* Legend */}
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
              {categoryData.length === 0 && (
                <p className="text-xs text-muted-foreground/50">Sem despesas no mês atual</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cash flow - stacked bar with saldo line */}
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
          {/* Summary row */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/20">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Entrada</p>
              <p className="text-sm font-bold text-success font-mono">{formatCurrency(monthRevenue)}</p>
            </div>
            <div className="flex-1 text-center border-x border-border/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Saída</p>
              <p className="text-sm font-bold text-destructive font-mono">{formatCurrency(monthExpenses)}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Saldo</p>
              <p className={`text-sm font-bold font-mono ${monthRevenue - monthExpenses - monthTaxes >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(monthRevenue - monthExpenses - monthTaxes)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
