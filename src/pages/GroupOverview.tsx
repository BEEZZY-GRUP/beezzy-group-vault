import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { KPICard } from '@/components/KPICard';
import { COMPANY_INFO, CompanyId } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useDateFilter } from '@/hooks/useDateFilter';

const COLORS = { beezzy: '#fff', palpita: '#F5C518', starmind: '#888' };

const chartTooltipStyle = {
  contentStyle: {
    background: '#111', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', color: '#fff', fontSize: '12px',
  },
};
const axisStyle = { fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'DM Sans' };

export default function GroupOverview() {
  const { expenses, revenues } = useData();
  const dateFilter = useDateFilter();

  const filteredRevenues = useMemo(() => revenues.filter(r => {
    const d = new Date(r.saleDate);
    return d >= dateFilter.from && d <= dateFilter.to;
  }), [revenues, dateFilter]);

  const filteredExpenses = useMemo(() => expenses.filter(e => {
    const d = new Date(e.dueDate);
    return d >= dateFilter.from && d <= dateFilter.to;
  }), [expenses, dateFilter]);

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.grossValue, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.value, 0);
  const totalFluxo = totalRevenue - totalExpenses;
  const totalSales = filteredRevenues.reduce((sum, r) => sum + r.quantity, 0);
  const totalTaxes = filteredRevenues.reduce((sum, r) => sum + r.taxAmount, 0);
  const resultado = totalFluxo - totalTaxes;

  const monthlyBuckets = useMemo(() => {
    const buckets: { key: string; label: string; month: number; year: number }[] = [];
    const d = new Date(dateFilter.from);
    while (d <= dateFilter.to) {
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), month: d.getMonth(), year: d.getFullYear() });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }, [dateFilter]);

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

  const fluxoByCompany = useMemo(() =>
    monthlyBuckets.map(b => {
      const row: any = { name: b.label };
      (['beezzy', 'palpita', 'starmind'] as CompanyId[]).forEach(c => {
        const rev = revenues.filter(r => r.company === c && new Date(r.saleDate).getMonth() === b.month && new Date(r.saleDate).getFullYear() === b.year).reduce((s, r) => s + r.grossValue, 0);
        const exp = expenses.filter(e => e.company === c && new Date(e.dueDate).getMonth() === b.month && new Date(e.dueDate).getFullYear() === b.year).reduce((s, e) => s + e.value, 0);
        row[c] = rev - exp;
      });
      return row;
    }),
    [revenues, expenses, monthlyBuckets]
  );

  const globalFatData = useMemo(() =>
    monthlyBuckets.map(b => ({
      name: b.label,
      value: revenues.filter(r => new Date(r.saleDate).getMonth() === b.month && new Date(r.saleDate).getFullYear() === b.year).reduce((s, r) => s + r.grossValue, 0),
    })),
    [revenues, monthlyBuckets]
  );

  const globalFluxoData = useMemo(() =>
    monthlyBuckets.map(b => {
      const rev = revenues.filter(r => new Date(r.saleDate).getMonth() === b.month && new Date(r.saleDate).getFullYear() === b.year).reduce((s, r) => s + r.grossValue, 0);
      const exp = expenses.filter(e => new Date(e.dueDate).getMonth() === b.month && new Date(e.dueDate).getFullYear() === b.year).reduce((s, e) => s + e.value, 0);
      return { name: b.label, value: rev - exp };
    }),
    [revenues, expenses, monthlyBuckets]
  );

  const contasPagar = useMemo(() =>
    filteredExpenses.filter(e => e.status !== 'pago').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [filteredExpenses]
  );

  const pendVal = filteredExpenses.filter(e => e.status === 'pendente').reduce((s, e) => s + e.value, 0);
  const vencVal = filteredExpenses.filter(e => e.status === 'vencido').reduce((s, e) => s + e.value, 0);
  const pagoVal = filteredExpenses.filter(e => e.status === 'pago').reduce((s, e) => s + e.value, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-[-0.02em]">Visão Geral do Grupo</h1>
        <p className="text-xs text-muted-foreground mt-1">Consolidado — {dateFilter.label}</p>
      </div>

      {/* 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Faturamento Total" value={totalRevenue} accent delta="▲ +12,4% vs mês ant." deltaType="up" delay={0} />
        <KPICard title="Despesas Totais" value={totalExpenses} delta="▲ +8,1% vs mês ant." deltaType="down" delay={1} />
        <KPICard title="Fluxo de Caixa" value={totalFluxo} valueColor="hsl(142 72% 39%)" delta="▲ +16,2% vs mês ant." deltaType="up" delay={2} />
        <KPICard title="Total de Vendas" value={totalSales} format="number" delta="▲ +9,7% vs mês ant." deltaType="up" delay={3} />
        <KPICard title="Impostos a Pagar" value={totalTaxes} delta="Vence em 8 dias" deltaType="warn" delay={4} />
        <KPICard title="Resultado Líquido" value={resultado} valueColor="hsl(142 72% 39%)" delta="▲ +14,8% vs mês ant." deltaType="up" delay={5} />
      </div>

      {/* 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Faturamento por Empresa</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
                <Line type="monotone" dataKey="beezzy" stroke="#fff" name="Beezzy" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} />
                <Line type="monotone" dataKey="palpita" stroke="#F5C518" name="Palpita" strokeWidth={2} dot={{ r: 3, fill: '#F5C518' }} />
                <Line type="monotone" dataKey="starmind" stroke="#888" name="Starmind" strokeWidth={2} dot={{ r: 3, fill: '#888' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Fluxo de Caixa por Empresa</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fluxoByCompany}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
                <Line type="monotone" dataKey="beezzy" stroke="#fff" name="Beezzy" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} />
                <Line type="monotone" dataKey="palpita" stroke="#F5C518" name="Palpita" strokeWidth={2} dot={{ r: 3, fill: '#F5C518' }} />
                <Line type="monotone" dataKey="starmind" stroke="#888" name="Starmind" strokeWidth={2} dot={{ r: 3, fill: '#888' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Faturamento Global do Grupo</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalFatData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="value" stroke="#F5C518" strokeWidth={2} dot={{ r: 2 }} fill="rgba(245,197,24,0.07)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[13px] font-medium">Fluxo de Caixa Total do Grupo</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dateFilter.label}</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={globalFluxoData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} fill="rgba(22,163,74,0.7)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategic Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="glass-card p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2.5">Caixa Emergência</div>
          <div className="font-display text-[22px] font-semibold tracking-[-0.02em] mb-3">R$ 85.000</div>
          <div className="text-[11px] text-muted-foreground mb-1.5">Meta: R$ 150.000 — 57% atingido</div>
          <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-sm overflow-hidden">
            <div className="h-full bg-warning rounded-sm" style={{ width: '57%' }} />
          </div>
          <div className="text-[10px] text-warning mt-2">Abaixo da meta recomendada</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2.5">Caixa Investimento</div>
          <div className="font-display text-[22px] font-semibold tracking-[-0.02em] mb-3">R$ 210.000</div>
          <div className="text-[11px] text-muted-foreground mb-1.5">Alocação YTD: R$ 58.000</div>
          <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-sm overflow-hidden">
            <div className="h-full accent-gradient rounded-sm" style={{ width: '72%' }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">▲ +8,3% vs mês anterior</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2.5">Caixa Dividendos</div>
          <div className="font-display text-[22px] font-semibold tracking-[-0.02em] mb-3">R$ 62.000</div>
          <div className="text-[11px] text-muted-foreground mb-1.5">Última distribuição: 28/02/2026</div>
          <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-sm overflow-hidden">
            <div className="h-full accent-gradient rounded-sm" style={{ width: '41%' }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">Próxima distribuição: 30/04/2026</div>
        </div>
      </div>

      {/* Contas a Pagar Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <span className="text-[13px] font-medium">Contas a Pagar — Consolidado</span>
          <div className="flex gap-2">
            <select className="bg-secondary border border-input rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground outline-none">
              <option>Todas as empresas</option>
              <option>Beezzy</option>
              <option>Palpita.io</option>
              <option>Starmind</option>
            </select>
            <select className="bg-secondary border border-input rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground outline-none">
              <option>Todos os status</option>
              <option>Pendente</option>
              <option>Pago</option>
              <option>Vencido</option>
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[rgba(255,255,255,0.02)]">
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Empresa</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Descrição</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Categoria</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Valor</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Vencimento</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(e => (
              <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-[11px_18px] text-xs">
                  <span className={`badge-${e.company} inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded`}>
                    {COMPANY_INFO[e.company].name}
                  </span>
                </td>
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
        <div className="flex gap-6 p-3 px-[18px] border-t border-border bg-[rgba(255,255,255,0.01)] text-[11px] text-muted-foreground">
          <span className="text-warning">Pendente: <span className="font-medium">{formatCurrency(pendVal)}</span></span>
          <span className="text-destructive">Vencido: <span className="font-medium">{formatCurrency(vencVal)}</span></span>
          <span className="text-success">Pago: <span className="font-medium">{formatCurrency(pagoVal)}</span></span>
        </div>
      </div>
    </motion.div>
  );
}
