import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, DEFAULT_CATEGORIES, DocFile, Expense } from '@/lib/types';
import { generateId } from '@/lib/formatters';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DocumentUpload } from './DocumentUpload';

export function ExpenseForm({ companyId }: { companyId: CompanyId }) {
  const { addExpense, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);
  const categories = [...DEFAULT_CATEGORIES, ...settings.customCategories];

  const [form, setForm] = useState({
    description: '', category: '', value: '', dueDate: '', paymentDate: '', status: 'pendente', costCenter: '', notes: '',
  });
  const [documents, setDocuments] = useState<DocFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.category || !form.value || !form.dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const expense: Expense = {
      id: generateId(), company: companyId, description: form.description,
      category: form.category, value: parseFloat(form.value), dueDate: form.dueDate,
      paymentDate: form.paymentDate || undefined, status: form.status as any,
      costCenter: form.costCenter || undefined, notes: form.notes || undefined,
      documents,
    };
    addExpense(expense);
    toast.success('Despesa registrada com sucesso');
    setForm({ description: '', category: '', value: '', dueDate: '', paymentDate: '', status: 'pendente', costCenter: '', notes: '' });
    setDocuments([]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[720px]">
      <div className="font-display text-base font-medium mb-5">Nova Despesa</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Descrição</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Google Ads — Abril 2026"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Categoria</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-muted-foreground outline-none focus:border-primary transition-colors">
              <option value="">Selecione</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor (R$)</label>
            <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="0,00"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data de Vencimento</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data de Pagamento (opcional)</label>
            <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Centro de Custo</label>
            <input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))}
              placeholder="Ex: Comercial"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-muted-foreground outline-none focus:border-primary transition-colors">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Observações</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Informações adicionais..."
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors resize-y min-h-[80px]" />
          </div>
        </div>

        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.07em] mb-3">Documentos</div>
          <div className="grid grid-cols-3 gap-3">
            <DocumentUpload label="Contrato" documents={documents.filter(d => d.name.startsWith('[contrato]'))} onDocumentsChange={docs => setDocuments(prev => [...prev.filter(d => !d.name.startsWith('[contrato]')), ...docs.map(d => ({ ...d, name: `[contrato] ${d.name}` }))])} />
            <DocumentUpload label="Nota Fiscal" documents={documents.filter(d => d.name.startsWith('[nf]'))} onDocumentsChange={docs => setDocuments(prev => [...prev.filter(d => !d.name.startsWith('[nf]')), ...docs.map(d => ({ ...d, name: `[nf] ${d.name}` }))])} />
            <DocumentUpload label="Outros Documentos" documents={documents.filter(d => !d.name.startsWith('[contrato]') && !d.name.startsWith('[nf]'))} onDocumentsChange={docs => setDocuments(prev => [...prev.filter(d => d.name.startsWith('[contrato]') || d.name.startsWith('[nf]')), ...docs])} />
          </div>
        </div>

        <div className="flex gap-2.5 pt-6">
          <button type="submit" className="px-6 py-[10px] accent-gradient rounded-[6px] font-display text-[13px] font-semibold text-black hover:opacity-90 active:scale-[0.98] transition-all">
            Salvar Despesa
          </button>
          <button type="button" onClick={() => setForm({ description: '', category: '', value: '', dueDate: '', paymentDate: '', status: 'pendente', costCenter: '', notes: '' })}
            className="px-5 py-[10px] border border-input rounded-[6px] text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}
