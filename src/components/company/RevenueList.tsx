import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, Revenue } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Trash2, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DateFilterState, isInDateRange } from '@/components/DateFilterBar';
import { EditRevenueModal } from './EditRevenueModal';

interface Props {
  companyId: CompanyId;
  dateFilter: DateFilterState;
}

export function RevenueList({ companyId, dateFilter }: Props) {
  const { getCompanyRevenues, deleteRevenue } = useData();
  const allRevenues = getCompanyRevenues(companyId);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Revenue | null>(null);

  const filtered = useMemo(() =>
    allRevenues
      .filter(r => isInDateRange(r.saleDate, dateFilter))
      .filter(r => !search || r.description.toLowerCase().includes(search.toLowerCase()) || r.client.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()),
    [allRevenues, dateFilter, search]
  );

  const totalGross = filtered.reduce((s, r) => s + r.grossValue, 0);
  const totalTax = filtered.reduce((s, r) => s + r.taxAmount, 0);
  const totalNet = filtered.reduce((s, r) => s + r.netValue, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {editing && <EditRevenueModal revenue={editing} companyId={companyId} onClose={() => setEditing(null)} />}

      <div className="glass-card overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <span className="text-[13px] font-medium">Faturamentos</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="bg-secondary border border-input rounded-md pl-7 pr-3 py-1.5 text-[11px] text-foreground outline-none w-40 focus:border-primary transition-colors"
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[rgba(255,255,255,0.02)]">
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Descrição</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Cliente</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Valor Bruto</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Imposto</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Líquido</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Data</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-[11px_18px] text-xs">{r.description}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{r.client || '—'}</td>
                <td className="p-[11px_18px] text-xs">{formatCurrency(r.grossValue)}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{formatCurrency(r.taxAmount)}</td>
                <td className="p-[11px_18px] text-xs text-primary font-medium">{formatCurrency(r.netValue)}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{formatDate(r.saleDate)}</td>
                <td className="p-[11px_18px] text-xs">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setEditing(r)}>
                      <Pencil className="w-[13px] h-[13px]" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive transition-colors" onClick={() => { if (window.confirm('Tem certeza que deseja excluir este faturamento?')) { deleteRevenue(r.id); toast.success('Faturamento removido'); } }}>
                      <Trash2 className="w-[13px] h-[13px]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-muted-foreground/50 text-xs">Nenhum faturamento encontrado</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex gap-6 p-3 px-[18px] border-t border-border bg-[rgba(255,255,255,0.01)] text-[11px] text-muted-foreground">
          <span>Bruto: <span className="font-medium text-foreground">{formatCurrency(totalGross)}</span></span>
          <span>Impostos: <span className="font-medium text-warning">{formatCurrency(totalTax)}</span></span>
          <span className="text-success">Líquido: <span className="font-medium">{formatCurrency(totalNet)}</span></span>
        </div>
      </div>
    </motion.div>
  );
}
