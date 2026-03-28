import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Trash2, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DateFilterState, isInDateRange } from '@/components/DateFilterBar';

interface Props {
  companyId: CompanyId;
  dateFilter: DateFilterState;
}

export function AccountsPayable({ companyId, dateFilter }: Props) {
  const { getCompanyExpenses, deleteExpense, updateExpense } = useData();
  const allExpenses = getCompanyExpenses(companyId);

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    allExpenses
      .filter(e => isInDateRange(e.dueDate, dateFilter))
      .filter(e => statusFilter === 'all' || e.status === statusFilter)
      .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [allExpenses, dateFilter, statusFilter, search]
  );

  const pend = filtered.filter(e => e.status === 'pendente').reduce((s, e) => s + e.value, 0);
  const venc = filtered.filter(e => e.status === 'vencido').reduce((s, e) => s + e.value, 0);
  const pago = filtered.filter(e => e.status === 'pago').reduce((s, e) => s + e.value, 0);

  const toggleStatus = (id: string) => {
    const exp = allExpenses.find(e => e.id === id);
    if (exp) {
      updateExpense({ ...exp, status: exp.status === 'pago' ? 'pendente' : 'pago' });
      toast.success('Status atualizado');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="glass-card overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <span className="text-[13px] font-medium">Contas a Pagar</span>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-secondary border border-input rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
            </select>
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
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[rgba(255,255,255,0.02)]">
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Descrição</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Categoria</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Valor</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Vencimento</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Status</th>
              <th className="text-left p-[9px_18px] text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-[11px_18px] text-xs">{e.description}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{e.category}</td>
                <td className="p-[11px_18px] text-xs">{formatCurrency(e.value)}</td>
                <td className="p-[11px_18px] text-xs text-muted-foreground">{formatDate(e.dueDate)}</td>
                <td className="p-[11px_18px] text-xs">
                  <span className={`status-${e.status} inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer`} onClick={() => toggleStatus(e.id)}>
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </span>
                </td>
                <td className="p-[11px_18px] text-xs">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => toggleStatus(e.id)}>
                      <Pencil className="w-[13px] h-[13px]" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive transition-colors" onClick={() => { deleteExpense(e.id); toast.success('Registro removido'); }}>
                      <Trash2 className="w-[13px] h-[13px]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground/50 text-xs">Nenhuma despesa encontrada</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex gap-6 p-3 px-[18px] border-t border-border bg-[rgba(255,255,255,0.01)] text-[11px] text-muted-foreground">
          <span className="text-warning">Pendente: <span className="font-medium">{formatCurrency(pend)}</span></span>
          <span className="text-destructive">Vencido: <span className="font-medium">{formatCurrency(venc)}</span></span>
          <span className="text-success">Pago: <span className="font-medium">{formatCurrency(pago)}</span></span>
        </div>
      </div>
    </motion.div>
  );
}
