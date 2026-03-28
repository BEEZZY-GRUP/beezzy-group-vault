import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

export function Reports({ companyId }: { companyId: CompanyId }) {
  const { getCompanyExpenses, getCompanyRevenues, getCompanySettings } = useData();
  const expenses = getCompanyExpenses(companyId);
  const revenues = getCompanyRevenues(companyId);
  const settings = getCompanySettings(companyId);
  const [period, setPeriod] = useState('6');

  const monthlyData = useMemo(() => {
    const months = parseInt(period);
    const data: { name: string; faturamento: number; despesas: number; impostos: number; resultado: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      const rev = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.grossValue, 0);
      const exp = expenses.filter(e => { const ed = new Date(e.dueDate); return ed.getMonth() === m && ed.getFullYear() === y; }).reduce((s, e) => s + e.value, 0);
      const tax = revenues.filter(r => { const rd = new Date(r.saleDate); return rd.getMonth() === m && rd.getFullYear() === y; }).reduce((s, r) => s + r.taxAmount, 0);
      data.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        faturamento: rev,
        despesas: exp,
        impostos: tax,
        resultado: rev - exp - tax,
      });
    }
    return data;
  }, [revenues, expenses, period]);

  const totals = useMemo(() => monthlyData.reduce((acc, d) => ({
    faturamento: acc.faturamento + d.faturamento,
    despesas: acc.despesas + d.despesas,
    impostos: acc.impostos + d.impostos,
    resultado: acc.resultado + d.resultado,
  }), { faturamento: 0, despesas: 0, impostos: 0, resultado: 0 }), [monthlyData]);

  const tooltipStyle = { contentStyle: { background: 'hsl(240 8% 8%)', border: '1px solid hsl(240 6% 16%)', borderRadius: '8px', color: '#fff' } };

  const exportCSV = () => {
    const headers = 'Mês,Faturamento,Despesas,Impostos,Resultado\n';
    const rows = monthlyData.map(d => `${d.name},${d.faturamento},${d.despesas},${d.impostos},${d.resultado}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${companyId}.csv`;
    a.click();
    toast.success('Relatório exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <FileDown className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Faturamento x Despesas x Resultado</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="faturamento" name="Faturamento" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="impostos" name="Impostos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground text-left">
              <th className="p-3 font-medium">Período</th>
              <th className="p-3 font-medium">Faturamento</th>
              <th className="p-3 font-medium">Despesas</th>
              <th className="p-3 font-medium">Impostos</th>
              <th className="p-3 font-medium">Resultado Líquido</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(d => (
              <tr key={d.name} className="border-b border-border/30">
                <td className="p-3">{d.name}</td>
                <td className="p-3 text-success">{formatCurrency(d.faturamento)}</td>
                <td className="p-3 text-destructive">{formatCurrency(d.despesas)}</td>
                <td className="p-3 text-warning">{formatCurrency(d.impostos)}</td>
                <td className="p-3 font-semibold">{formatCurrency(d.resultado)}</td>
              </tr>
            ))}
            <tr className="bg-secondary/30 font-semibold">
              <td className="p-3">Total</td>
              <td className="p-3 text-success">{formatCurrency(totals.faturamento)}</td>
              <td className="p-3 text-destructive">{formatCurrency(totals.despesas)}</td>
              <td className="p-3 text-warning">{formatCurrency(totals.impostos)}</td>
              <td className="p-3">{formatCurrency(totals.resultado)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
