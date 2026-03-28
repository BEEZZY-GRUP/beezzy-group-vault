import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, Receipt, ShoppingCart } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#6B7280'];

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
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const total = revenues.filter(r => {
        const rd = new Date(r.saleDate);
        return rd.getMonth() === m && rd.getFullYear() === y;
      }).reduce((s, r) => s + r.grossValue, 0);
      data.push({ name: d.toLocaleDateString('pt-BR', { month: 'short' }), value: total });
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

  const tooltipStyle = { contentStyle: { background: '#fff', border: '1px solid hsl(220 13% 91%)', borderRadius: '8px', color: '#1a1a2e' } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Faturamento do Mês" value={monthRevenue} icon={DollarSign} />
        <KPICard title="Despesas do Mês" value={monthExpenses} icon={TrendingDown} />
        <KPICard title="Fluxo de Caixa" value={monthRevenue - monthExpenses} icon={ArrowRightLeft} />
        <KPICard title="Impostos Calculados" value={monthTaxes} icon={Receipt} trend={`Alíquota: ${settings.taxRate}%`} />
        <KPICard title="Vendas" value={monthSales} icon={ShoppingCart} format="number" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
