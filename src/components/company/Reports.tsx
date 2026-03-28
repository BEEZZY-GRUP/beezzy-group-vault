import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

export function Reports({ companyId }: { companyId: CompanyId }) {
  const { getCompanyExpenses, getCompanyRevenues } = useData();
  const expenses = getCompanyExpenses(companyId);
  const revenues = getCompanyRevenues(companyId);
  const [period, setPeriod] = useState('6');

  const monthlyData = useMemo(() => {
    const months = parseInt(period);
    const data: { name: string; faturamento: number; despesas: number; impostos: number; resultado: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const rev = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.grossValue, 0);
      const exp = expenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === m && ed.getFullYear() === y; }).reduce((s, e) => s + e.value, 0);
      const tax = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.taxAmount, 0);
      data.push({ name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), faturamento: rev, despesas: exp, impostos: tax, resultado: rev - exp - tax });
    }
    return data;
  }, [revenues, expenses, period]);

  const totals = useMemo(() => monthlyData.reduce((acc, d) => ({
    faturamento: acc.faturamento + d.faturamento, despesas: acc.despesas + d.despesas,
    impostos: acc.impostos + d.impostos, resultado: acc.resultado + d.resultado,
  }), { faturamento: 0, despesas: 0, impostos: 0, resultado: 0 }), [monthlyData]);

  const exportCSV = () => {
    const headers = 'Mês,Faturamento,Despesas,Impostos,Resultado\n';
    const rows = monthlyData.map(d => `${d.name},${d.faturamento},${d.despesas},${d.impostos},${d.resultado}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${companyId}.csv`; a.click();
    toast.success('Relatório exportado');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <FileDown className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Faturamento x Despesas x Resultado</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 15% 55%)' }} />
            <Bar dataKey="faturamento" name="Faturamento" fill="#10B981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
            <Bar dataKey="impostos" name="Impostos" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card/95 backdrop-blur-sm">
            <tr className="border-b border-border/30 text-muted-foreground/70 text-left">
              <th className="p-4 font-medium text-xs uppercase tracking-wider">Período</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider">Faturamento</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider">Despesas</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider">Impostos</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(d => (
              <tr key={d.name} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{d.name}</td>
                <td className="p-4 text-success font-mono">{formatCurrency(d.faturamento)}</td>
                <td className="p-4 text-destructive font-mono">{formatCurrency(d.despesas)}</td>
                <td className="p-4 text-warning font-mono">{formatCurrency(d.impostos)}</td>
                <td className="p-4 font-semibold font-mono">{formatCurrency(d.resultado)}</td>
              </tr>
            ))}
            <tr className="bg-secondary/20 font-semibold">
              <td className="p-4">Total</td>
              <td className="p-4 text-success font-mono">{formatCurrency(totals.faturamento)}</td>
              <td className="p-4 text-destructive font-mono">{formatCurrency(totals.despesas)}</td>
              <td className="p-4 text-warning font-mono">{formatCurrency(totals.impostos)}</td>
              <td className="p-4 font-mono">{formatCurrency(totals.resultado)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
