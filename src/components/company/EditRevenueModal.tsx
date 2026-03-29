import { useState } from 'react';
import { Revenue, CompanyId, PAYMENT_METHODS } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Props {
  revenue: Revenue;
  companyId: CompanyId;
  onClose: () => void;
}

export function EditRevenueModal({ revenue, companyId, onClose }: Props) {
  const { updateRevenue, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);

  const [form, setForm] = useState({
    description: revenue.description,
    client: revenue.client,
    grossValue: String(revenue.grossValue),
    saleDate: revenue.saleDate,
    paymentMethod: revenue.paymentMethod,
    quantity: String(revenue.quantity),
    notes: revenue.notes || '',
  });

  const gross = parseFloat(form.grossValue) || 0;
  const taxAmount = Math.round(gross * settings.taxRate / 100 * 100) / 100;
  const netValue = gross - taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.grossValue || !form.saleDate || !form.paymentMethod) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    updateRevenue({
      ...revenue,
      description: form.description,
      client: form.client,
      grossValue: gross,
      taxAmount,
      netValue,
      saleDate: form.saleDate,
      paymentMethod: form.paymentMethod,
      quantity: parseInt(form.quantity) || 1,
      notes: form.notes || undefined,
    });
    toast.success('Faturamento atualizado');
    onClose();
  };

  const inputClass = "w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-[560px] max-h-[85vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border">
          <span className="font-display text-sm font-medium">Editar Faturamento</span>
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
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Cliente</label>
              <input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor Bruto (R$)</label>
              <input type="number" value={form.grossValue} onChange={e => setForm(f => ({ ...f, grossValue: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Imposto ({settings.taxRate}%)</label>
              <input readOnly value={gross > 0 ? formatCurrency(taxAmount) : '—'} className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor Líquido</label>
              <input readOnly value={gross > 0 ? formatCurrency(netValue) : '—'} className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data da Venda</label>
              <input type="date" value={form.saleDate} onChange={e => setForm(f => ({ ...f, saleDate: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Forma de Pagamento</label>
              <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className={inputClass}>
                <option value="">Selecione</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Quantidade</label>
              <input type="number" value={form.quantity} min="1" onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inputClass} />
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
