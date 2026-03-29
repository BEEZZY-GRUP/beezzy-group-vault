import { useState } from 'react';
import { Expense, DEFAULT_CATEGORIES, CompanyId } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Props {
  expense: Expense;
  companyId: CompanyId;
  onClose: () => void;
}

export function EditExpenseModal({ expense, companyId, onClose }: Props) {
  const { updateExpense, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);
  const categories = [...DEFAULT_CATEGORIES, ...settings.customCategories];

  const [form, setForm] = useState({
    description: expense.description,
    category: expense.category,
    value: String(expense.value),
    dueDate: expense.dueDate,
    paymentDate: expense.paymentDate || '',
    status: expense.status,
    costCenter: expense.costCenter || '',
    notes: expense.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.category || !form.value || !form.dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    updateExpense({
      ...expense,
      description: form.description,
      category: form.category,
      value: parseFloat(form.value),
      dueDate: form.dueDate,
      paymentDate: form.paymentDate || undefined,
      status: form.status as Expense['status'],
      costCenter: form.costCenter || undefined,
      notes: form.notes || undefined,
    });
    toast.success('Despesa atualizada');
    onClose();
  };

  const inputClass = "w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-[560px] max-h-[85vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border">
          <span className="font-display text-sm font-medium">Editar Despesa</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Descrição</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
                <option value="">Selecione</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor (R$)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data de Vencimento</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data de Pagamento</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Expense['status'] }))} className={inputClass}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Centro de Custo</label>
              <input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Observações</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputClass} resize-y min-h-[60px]`} />
            </div>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="submit" className="px-6 py-[10px] accent-gradient rounded-[6px] font-display text-[13px] font-semibold text-black hover:opacity-90 active:scale-[0.98] transition-all">
              Salvar Alterações
            </button>
            <button type="button" onClick={onClose} className="px-5 py-[10px] border border-input rounded-[6px] text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
