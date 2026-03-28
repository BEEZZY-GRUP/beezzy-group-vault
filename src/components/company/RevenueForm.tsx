import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, PAYMENT_METHODS, Revenue } from '@/lib/types';
import { generateId, formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Paperclip, X, Upload, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

export function RevenueForm({ companyId }: { companyId: CompanyId }) {
  const { addRevenue, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);

  const [form, setForm] = useState({
    description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '',
  });
  const [docs, setDocs] = useState<{ notaFiscal: File | null; outros: File[] }>({ notaFiscal: null, outros: [] });

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
      documents: [
        ...(docs.notaFiscal ? [{ name: docs.notaFiscal.name, type: 'nota-fiscal', size: docs.notaFiscal.size }] : []),
        ...docs.outros.map(f => ({ name: f.name, type: 'outro', size: f.size })),
      ],
    };
    addRevenue(revenue);
    toast.success('Faturamento salvo com sucesso!');
    setForm({ description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '' });
    setDocs({ notaFiscal: null, outros: [] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Lançar Faturamento</h2>
        <p className="text-sm text-muted-foreground mt-1">Registre uma nova venda ou receita</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição / Produto *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</Label>
            <Input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Bruto (R$) *</Label>
            <Input type="number" step="0.01" value={form.grossValue} onChange={e => setForm(f => ({ ...f, grossValue: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 font-mono focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Imposto Calculado</Label>
            <Input value={formatCurrency(taxAmount)} readOnly className="bg-secondary/20 border-border/30 h-11 cursor-not-allowed font-mono text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Líquido</Label>
            <Input value={formatCurrency(netValue)} readOnly className="bg-secondary/20 border-border/30 h-11 cursor-not-allowed font-mono text-success" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data da Venda *</Label>
            <Input type="date" value={form.saleDate} onChange={e => setForm(f => ({ ...f, saleDate: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forma de Pagamento *</Label>
            <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
              <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantidade</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
        </div>

        {gross > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 flex items-center gap-4">
              <Calculator className="h-5 w-5 text-primary shrink-0" />
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span><span className="text-muted-foreground">Bruto:</span> <span className="font-semibold text-foreground">{formatCurrency(gross)}</span></span>
                <span><span className="text-muted-foreground">Alíquota:</span> <span className="font-semibold text-foreground">{settings.taxRate}%</span></span>
                <span><span className="text-muted-foreground">Imposto:</span> <span className="font-semibold text-warning">{formatCurrency(taxAmount)}</span></span>
                <span><span className="text-muted-foreground">Líquido:</span> <span className="font-bold text-success">{formatCurrency(netValue)}</span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observações</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-secondary/50 border-border/50 min-h-[80px] focus:border-primary/50" />
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documentos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <button type="button" onClick={() => document.getElementById(`rev-nf-${companyId}`)?.click()}
                className="w-full flex items-center gap-2 justify-center py-3 px-4 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Upload className="h-4 w-4" /> Nota Fiscal de Saída
              </button>
              <input id={`rev-nf-${companyId}`} type="file" accept=".pdf,.jpg,.png" className="hidden"
                onChange={e => setDocs(d => ({ ...d, notaFiscal: e.target.files?.[0] || null }))} />
              {docs.notaFiscal && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{docs.notaFiscal.name}</span>
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive shrink-0" onClick={() => setDocs(d => ({ ...d, notaFiscal: null }))} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => document.getElementById(`rev-outros-${companyId}`)?.click()}
                className="w-full flex items-center gap-2 justify-center py-3 px-4 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Paperclip className="h-4 w-4" /> Outros Documentos
              </button>
              <input id={`rev-outros-${companyId}`} type="file" multiple className="hidden"
                onChange={e => setDocs(d => ({ ...d, outros: [...d.outros, ...Array.from(e.target.files || [])] }))} />
              {docs.outros.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive shrink-0" onClick={() => setDocs(d => ({ ...d, outros: d.outros.filter((_, j) => j !== i) }))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/30">
          <Button type="submit" className="px-8">Salvar Faturamento</Button>
          <Button type="button" variant="outline"
            onClick={() => setForm({ description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '' })}>
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
