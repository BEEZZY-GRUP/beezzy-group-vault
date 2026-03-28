import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DateFilterState } from '@/components/DateFilterBar';

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

export function Reports({ companyId, dateFilter }: Props) {
  const { getCompanyExpenses, getCompanyRevenues, getCompanySettings } = useData();
  const expenses = getCompanyExpenses(companyId);
  const revenues = getCompanyRevenues(companyId);
  const settings = getCompanySettings(companyId);

  const monthlyBuckets = useMemo(() => {
    const buckets: { label: string; month: number; year: number }[] = [];
    const d = new Date(dateFilter.from);
    while (d <= dateFilter.to) {
      buckets.push({ label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''), month: d.getMonth(), year: d.getFullYear() });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }, [dateFilter]);

  const monthlyData = useMemo(() =>
    monthlyBuckets.map(b => {
      const fat = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === b.month && rd.getFullYear() === b.year; }).reduce((s, r) => s + r.grossValue, 0);
      const desp = expenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === b.month && ed.getFullYear() === b.year; }).reduce((s, e) => s + e.value, 0);
      const imp = Math.round(fat * (settings.taxRate / 100));
      const fatLiq = fat - imp;
      return { name: b.label, fatBruto: fat, impostos: imp, fatLiquido: fatLiq, despesas: desp, resultado: fatLiq - desp };
    }),
    [revenues, expenses, monthlyBuckets, settings.taxRate]
  );

  const totals = useMemo(() => monthlyData.reduce((acc, d) => ({
    fatBruto: acc.fatBruto + d.fatBruto, impostos: acc.impostos + d.impostos,
    fatLiquido: acc.fatLiquido + d.fatLiquido, despesas: acc.despesas + d.despesas,
    resultado: acc.resultado + d.resultado,
  }), { fatBruto: 0, impostos: 0, fatLiquido: 0, despesas: 0, resultado: 0 }), [monthlyData]);

  const exportCSV = () => {
    const headers = 'Mês,Fat. Bruto,Impostos,Fat. Líquido,Despesas,Resultado\n';
    const rows = monthlyData.map(d => `${d.name},${d.fatBruto},${d.impostos},${d.fatLiquido},${d.despesas},${d.resultado}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${companyId}.csv`; a.click();
    toast.success('Relatório exportado');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2">Fat. Bruto Total</div>
          <div className="font-display text-lg font-semibold tracking-[-0.02em]">{formatCurrency(totals.fatBruto)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2">Impostos Total</div>
          <div className="font-display text-lg font-semibold tracking-[-0.02em] text-warning">{formatCurrency(totals.impostos)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2">Despesas Total</div>
          <div className="font-display text-lg font-semibold tracking-[-0.02em] text-destructive">{formatCurrency(totals.despesas)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] mb-2">Resultado</div>
          <div className={`font-display text-lg font-semibold tracking-[-0.02em] ${totals.resultado >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(totals.resultado)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[13px] font-medium">Faturamento x Despesas</div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-[6px] text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileDown className="w-3 h-3" /> Exportar CSV
          </button>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="fatBruto" name="Faturamento" fill="rgba(245,197,24,0.6)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="rgba(239,68,68,0.45)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[rgba(255,255,255,0.02)]">
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Mês</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Fat. Bruto</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Impostos</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Fat. Líquido</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Despesas</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(d => (
              <tr key={d.name} className="border-b border-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-[11px_18px] text-xs font-medium">{d.name}</td>
                <td className="p-[11px_18px] text-xs">{formatCurrency(d.fatBruto)}</td>
                <td className="p-[11px_18px] text-xs text-warning">{formatCurrency(d.impostos)}</td>
                <td className="p-[11px_18px] text-xs">{formatCurrency(d.fatLiquido)}</td>
                <td className="p-[11px_18px] text-xs text-destructive">{formatCurrency(d.despesas)}</td>
                <td className={`p-[11px_18px] text-xs font-medium ${d.resultado >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(d.resultado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
