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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por descrição..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {DEFAULT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground text-left">
                <th className="p-3 font-medium">Descrição</th>
                <th className="p-3 font-medium">Categoria</th>
                <th className="p-3 font-medium">Valor</th>
                <th className="p-3 font-medium">Vencimento</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Docs</th>
                <th className="p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 text-muted-foreground">{e.category}</td>
                  <td className="p-3 font-medium">{formatCurrency(e.value)}</td>
                  <td className="p-3">{formatDate(e.dueDate)}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={`status-${e.status} border-0 text-xs cursor-pointer`} onClick={() => toggleStatus(e.id)}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {e.documents.length > 0 && <FileText className="h-4 w-4 text-muted-foreground" />}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatus(e.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteExpense(e.id); toast.success('Despesa excluída'); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma despesa encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-6 p-4 border-t border-border/50 text-sm">
          <span>Total Pendente: <span className="font-semibold text-warning">{formatCurrency(totals.pendente)}</span></span>
          <span>Total Pago: <span className="font-semibold text-success">{formatCurrency(totals.pago)}</span></span>
          <span>Total Vencido: <span className="font-semibold text-destructive">{formatCurrency(totals.vencido)}</span></span>
        </div>
      </div>
    </div>
  );
}
