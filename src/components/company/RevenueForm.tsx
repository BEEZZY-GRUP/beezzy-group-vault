import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, DocFile, PAYMENT_METHODS, Revenue } from '@/lib/types';
import { generateId, formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DocumentUpload } from './DocumentUpload';

export function RevenueForm({ companyId }: { companyId: CompanyId }) {
  const { addRevenue, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);

  const [form, setForm] = useState({
    description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '',
  });
  const [documents, setDocuments] = useState<DocFile[]>([]);

  const gross = parseFloat(form.grossValue) || 0;
  const taxAmount = Math.round(gross * settings.taxRate / 100 * 100) / 100;
  const netValue = gross - taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.grossValue || !form.saleDate || !form.paymentMethod) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const revenue: Revenue = {
      id: generateId(), company: companyId, description: form.description,
      client: form.client, grossValue: gross, taxAmount, netValue,
      saleDate: form.saleDate, paymentMethod: form.paymentMethod,
      quantity: parseInt(form.quantity) || 1, notes: form.notes || undefined,
      documents: [],
    };
    addRevenue(revenue);
    toast.success('Faturamento registrado com sucesso');
    setForm({ description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[720px]">
      <div className="font-display text-base font-medium mb-5">Novo Faturamento</div>

      {/* Tax notice */}
      <div className="border-l-[3px] border-l-primary bg-primary/[0.12] rounded-r-[6px] px-[18px] py-3.5 mb-5 text-xs text-muted-foreground">
        Alíquota configurada para <strong className="text-foreground">{settings.name}</strong>: <strong className="text-primary">{settings.taxRate}%</strong>. O imposto será calculado automaticamente sobre o valor bruto.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Descrição / Serviço / Produto</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Assinatura mensal Plano Pro"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Cliente</label>
            <input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
              placeholder="Nome do cliente"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor Bruto (R$)</label>
            <input type="number" value={form.grossValue} onChange={e => setForm(f => ({ ...f, grossValue: e.target.value }))}
              placeholder="0"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Imposto Calculado (R$)</label>
            <input readOnly value={gross > 0 ? formatCurrency(taxAmount) : '—'}
              className="w-full bg-secondary/50 border border-input/50 rounded-[6px] px-3.5 py-2.5 text-[13px] text-primary font-medium cursor-not-allowed outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Valor Líquido (R$)</label>
            <input readOnly value={gross > 0 ? formatCurrency(netValue) : '—'}
              className="w-full bg-secondary/50 border border-input/50 rounded-[6px] px-3.5 py-2.5 text-[13px] text-primary font-medium cursor-not-allowed outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Data da Venda</label>
            <input type="date" value={form.saleDate} onChange={e => setForm(f => ({ ...f, saleDate: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Forma de Pagamento</label>
            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-muted-foreground outline-none focus:border-primary transition-colors">
              <option value="">Selecione</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Quantidade de Vendas</label>
            <input type="number" value={form.quantity} min="1" onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Observações</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Informações adicionais..."
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors resize-y min-h-[80px]" />
          </div>
        </div>

        {/* Tax summary */}
        {gross > 0 && (
          <div className="border-l-[3px] border-l-primary bg-primary/[0.12] rounded-r-[6px] px-[18px] py-3.5 text-xs text-muted-foreground flex gap-6 flex-wrap">
            <span>Valor Bruto: <span className="text-foreground font-medium">{formatCurrency(gross)}</span></span>
            <span>Alíquota: <span className="text-primary font-semibold">{settings.taxRate}%</span></span>
            <span>Imposto: <span className="text-foreground font-medium">{formatCurrency(taxAmount)}</span></span>
            <span>Valor Líquido: <span className="text-foreground font-medium">{formatCurrency(netValue)}</span></span>
          </div>
        )}

        {/* Upload */}
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.07em] mb-3">Documentos</div>
          <div className="grid grid-cols-2 gap-3">
            {['Nota Fiscal de Saída', 'Outros Documentos'].map(label => (
              <button type="button" key={label} onClick={() => toast.info(`Upload de ${label} simulado`)}
                className="border border-dashed border-input rounded-[6px] p-5 text-center hover:border-primary hover:bg-primary/[0.12] transition-all">
                <div className="text-[11px] font-medium mb-1">{label}</div>
                <div className="text-[10px] text-muted-foreground">PDF, JPG, PNG</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 pt-6">
          <button type="submit" className="px-6 py-[10px] accent-gradient rounded-[6px] font-display text-[13px] font-semibold text-black hover:opacity-90 active:scale-[0.98] transition-all">
            Salvar Faturamento
          </button>
          <button type="button" onClick={() => setForm({ description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '' })}
            className="px-5 py-[10px] border border-input rounded-[6px] text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}
