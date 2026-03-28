import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, Receipt, ShoppingCart } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    const data: { name: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const total = revenues.filter(r => {
        const rd = new Date(r.saleDate);
        return rd.getMonth() === m && rd.getFullYear() === y;
      }).reduce((s, r) => s + r.grossValue, 0);
      data.push({ name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), value: total });
    }
    return data;
  }, [revenues]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.filter(e => isCurrentMonth(e.dueDate)).forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.value;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const waterfallData = useMemo(() => [
    { name: 'Receita', value: monthRevenue, fill: '#10B981' },
    { name: 'Despesas', value: -monthExpenses, fill: '#EF4444' },
    { name: 'Impostos', value: -monthTaxes, fill: '#F59E0B' },
    { name: 'Resultado', value: monthRevenue - monthExpenses - monthTaxes, fill: '#3B82F6' },
  ], [monthRevenue, monthExpenses, monthTaxes]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Faturamento do Mês" value={monthRevenue} icon={DollarSign} delay={0} />
        <KPICard title="Despesas do Mês" value={monthExpenses} icon={TrendingDown} delay={1} />
        <KPICard title="Fluxo de Caixa" value={monthRevenue - monthExpenses} icon={ArrowRightLeft} delay={2} />
        <KPICard title="Impostos Calculados" value={monthTaxes} icon={Receipt} trend={`Alíquota: ${settings.taxRate}%`} delay={3} />
        <KPICard title="Vendas" value={monthSales} icon={ShoppingCart} format="number" delay={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita Mensal</h3>
            <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-md">6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} dot={false} fill="url(#revGrad)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
