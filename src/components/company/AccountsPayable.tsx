import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, DEFAULT_CATEGORIES } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AccountsPayable({ companyId }: { companyId: CompanyId }) {
  const { getCompanyExpenses, deleteExpense, updateExpense } = useData();
  const expenses = getCompanyExpenses(companyId);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    expenses
      .filter(e => statusFilter === 'all' || e.status === statusFilter)
      .filter(e => categoryFilter === 'all' || e.category === categoryFilter)
      .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [expenses, statusFilter, categoryFilter, search]
  );

  const totals = useMemo(() => ({
    pendente: filtered.filter(e => e.status === 'pendente').reduce((s, e) => s + e.value, 0),
    pago: filtered.filter(e => e.status === 'pago').reduce((s, e) => s + e.value, 0),
    vencido: filtered.filter(e => e.status === 'vencido').reduce((s, e) => s + e.value, 0),
  }), [filtered]);

  const toggleStatus = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
      updateExpense({ ...exp, status: exp.status === 'pago' ? 'pendente' : 'pago', paymentDate: exp.status === 'pago' ? undefined : new Date().toISOString().split('T')[0] });
      toast.success('Status atualizado');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por descrição..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-11 bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {DEFAULT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-sm">
              <tr className="border-b border-border/30 text-muted-foreground/70 text-left">
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Descrição</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Categoria</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Valor</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Vencimento</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Docs</th>
                <th className="p-4 font-medium text-xs uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                  <td className="p-4 font-medium text-foreground/90">{e.description}</td>
                  <td className="p-4 text-muted-foreground">{e.category}</td>
                  <td className="p-4 font-mono font-medium text-foreground/90">{formatCurrency(e.value)}</td>
                  <td className="p-4 text-foreground/60">{formatDate(e.dueDate)}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={`status-${e.status} border-0 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md cursor-pointer`} onClick={() => toggleStatus(e.id)}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {e.documents.length > 0 && <FileText className="h-4 w-4 text-muted-foreground/50" />}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => toggleStatus(e.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { deleteExpense(e.id); toast.success('Despesa excluída'); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground/50">Nenhuma despesa encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-6 p-5 border-t border-border/30 bg-secondary/10 text-sm">
          <span>Pendente: <span className="font-semibold text-warning font-mono">{formatCurrency(totals.pendente)}</span></span>
          <span>Pago: <span className="font-semibold text-success font-mono">{formatCurrency(totals.pago)}</span></span>
          <span>Vencido: <span className="font-semibold text-destructive font-mono">{formatCurrency(totals.vencido)}</span></span>
        </div>
      </div>
    </motion.div>
  );
}
