import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { KPICard } from '@/components/KPICard';
import { COMPANY_INFO, CompanyId } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { DollarSign, TrendingDown, ArrowRightLeft, ShoppingCart, Receipt } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

const COLORS = [COMPANY_INFO.beezzy.color, COMPANY_INFO.palpita.color, COMPANY_INFO.starmind.color];

export default function GroupOverview() {
  const { expenses, revenues, settings } = useData();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const totalRevenue = useMemo(() =>
    revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((sum, r) => sum + r.grossValue, 0),
    [revenues]
  );

  const totalExpenses = useMemo(() =>
    expenses.filter(e => isCurrentMonth(e.dueDate)).reduce((sum, e) => sum + e.value, 0),
    [expenses]
  );

  const totalSales = useMemo(() =>
    revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((sum, r) => sum + r.quantity, 0),
    [revenues]
  );

  const totalTaxes = useMemo(() =>
    revenues.filter(r => isCurrentMonth(r.saleDate)).reduce((sum, r) => sum + r.taxAmount, 0),
    [revenues]
  );

  const lineData = useMemo(() => {
    const months: Record<string, Record<string, number>> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months[key] = { beezzy: 0, palpita: 0, starmind: 0 };
    }
    revenues.forEach(r => {
      const d = new Date(r.saleDate);
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (months[key]) months[key][r.company] += r.grossValue;
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [revenues]);

  const barData = useMemo(() => {
    const companies: CompanyId[] = ['beezzy', 'palpita', 'starmind'];
    return companies.map(c => ({
      name: COMPANY_INFO[c].name,
      value: expenses.filter(e => e.company === c && isCurrentMonth(e.dueDate)).reduce((s, e) => s + e.value, 0),
    }));
  }, [expenses]);

  const pieData = useMemo(() => {
    const companies: CompanyId[] = ['beezzy', 'palpita', 'starmind'];
    return companies.map(c => ({
      name: COMPANY_INFO[c].name,
      value: revenues.filter(r => r.company === c && isCurrentMonth(r.saleDate)).reduce((s, r) => s + r.grossValue, 0),
    }));
  }, [revenues]);

  const contasPagar = useMemo(() =>
    expenses.filter(e => e.status !== 'pago').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [expenses]
  );

  const tooltipStyle = { contentStyle: { background: '#fff', border: '1px solid hsl(220 13% 91%)', borderRadius: '8px', color: '#1a1a2e' } };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Visão Geral do Grupo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Faturamento Total" value={totalRevenue} icon={DollarSign} />
        <KPICard title="Despesas Totais" value={totalExpenses} icon={TrendingDown} />
        <KPICard title="Fluxo de Caixa" value={totalRevenue - totalExpenses} icon={ArrowRightLeft} />
        <KPICard title="Total de Vendas" value={totalSales} icon={ShoppingCart} format="number" />
        <KPICard title="Impostos a Pagar" value={totalTaxes} icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Receita Mensal por Empresa</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="beezzy" stroke={COLORS[0]} name="Beezzy" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="palpita" stroke={COLORS[1]} name="Palpita.io" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="starmind" stroke={COLORS[2]} name="Starmind" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Despesas por Empresa</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" name="Despesas" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Participação no Faturamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Contas a Pagar</h3>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Empresa</th>
                  <th className="pb-2 font-medium">Descrição</th>
                  <th className="pb-2 font-medium">Valor</th>
                  <th className="pb-2 font-medium">Vencimento</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contasPagar.map(e => (
                  <tr key={e.id} className="border-b border-border/30">
                    <td className="py-2.5">{COMPANY_INFO[e.company].icon} {COMPANY_INFO[e.company].name}</td>
                    <td className="py-2.5">{e.description}</td>
                    <td className="py-2.5">{formatCurrency(e.value)}</td>
                    <td className="py-2.5">{formatDate(e.dueDate)}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={`status-${e.status} border-0 text-xs`}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
