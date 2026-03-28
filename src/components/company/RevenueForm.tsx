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
import { FileText, Paperclip, X } from 'lucide-react';

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
      id: generateId(),
      company: companyId,
      description: form.description,
      client: form.client,
      grossValue: gross,
      taxAmount,
      netValue,
      saleDate: form.saleDate,
      paymentMethod: form.paymentMethod,
      quantity: parseInt(form.quantity) || 1,
      notes: form.notes || undefined,
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
    <div className="glass-card p-6 max-w-3xl">
      <h2 className="text-lg font-semibold mb-6">Lançar Faturamento</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Descrição / Produto / Serviço *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Valor Bruto (R$) *</Label>
            <Input type="number" step="0.01" value={form.grossValue} onChange={e => setForm(f => ({ ...f, grossValue: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Imposto Calculado</Label>
            <Input value={formatCurrency(taxAmount)} readOnly className="bg-muted cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>Valor Líquido</Label>
            <Input value={formatCurrency(netValue)} readOnly className="bg-muted cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>Data da venda *</Label>
            <Input type="date" value={form.saleDate} onChange={e => setForm(f => ({ ...f, saleDate: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Forma de pagamento *</Label>
            <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
              <SelectTrigger className="bg-secondary"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-secondary" />
          </div>
        </div>

        {gross > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
            <span className="text-muted-foreground">Valor Bruto: </span><span className="font-medium">{formatCurrency(gross)}</span>
            <span className="text-muted-foreground ml-4">Alíquota: </span><span className="font-medium">{settings.taxRate}%</span>
            <span className="text-muted-foreground ml-4">Imposto: </span><span className="font-medium">{formatCurrency(taxAmount)}</span>
            <span className="text-muted-foreground ml-4">Valor Líquido: </span><span className="font-semibold text-primary">{formatCurrency(netValue)}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-secondary" />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">Documentos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`rev-nf-${companyId}`)?.click()}>
                <FileText className="h-4 w-4 mr-2" /> Upload Nota Fiscal de Saída
              </Button>
              <input id={`rev-nf-${companyId}`} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => setDocs(d => ({ ...d, notaFiscal: e.target.files?.[0] || null }))} />
              {docs.notaFiscal && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{docs.notaFiscal.name}</span><X className="h-3 w-3 cursor-pointer" onClick={() => setDocs(d => ({ ...d, notaFiscal: null }))} /></div>}
            </div>
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`rev-outros-${companyId}`)?.click()}>
                <Paperclip className="h-4 w-4 mr-2" /> Outros Documentos
              </Button>
              <input id={`rev-outros-${companyId}`} type="file" multiple className="hidden" onChange={e => setDocs(d => ({ ...d, outros: [...d.outros, ...Array.from(e.target.files || [])] }))} />
              {docs.outros.map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><span>{f.name}</span><X className="h-3 w-3 cursor-pointer" onClick={() => setDocs(d => ({ ...d, outros: d.outros.filter((_, j) => j !== i) }))} /></div>)}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar Faturamento</Button>
          <Button type="button" variant="outline" onClick={() => setForm({ description: '', client: '', grossValue: '', saleDate: '', paymentMethod: '', quantity: '1', notes: '' })}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
