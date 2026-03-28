import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, DEFAULT_CATEGORIES, Expense } from '@/lib/types';
import { generateId } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { FileText, Receipt, Paperclip, X } from 'lucide-react';

export function ExpenseForm({ companyId }: { companyId: CompanyId }) {
  const { addExpense, getCompanySettings } = useData();
  const settings = getCompanySettings(companyId);
  const categories = [...DEFAULT_CATEGORIES, ...settings.customCategories];

  const [form, setForm] = useState({
    description: '', category: '', value: '', dueDate: '', paymentDate: '', paid: false, costCenter: '', notes: '',
  });
  const [docs, setDocs] = useState<{ contrato: File | null; notaFiscal: File | null; outros: File[] }>({
    contrato: null, notaFiscal: null, outros: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.category || !form.value || !form.dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const expense: Expense = {
      id: generateId(),
      company: companyId,
      description: form.description,
      category: form.category,
      value: parseFloat(form.value),
      dueDate: form.dueDate,
      paymentDate: form.paymentDate || undefined,
      status: form.paid ? 'pago' : 'pendente',
      costCenter: form.costCenter || undefined,
      notes: form.notes || undefined,
      documents: [
        ...(docs.contrato ? [{ name: docs.contrato.name, type: 'contrato', size: docs.contrato.size }] : []),
        ...(docs.notaFiscal ? [{ name: docs.notaFiscal.name, type: 'nota-fiscal', size: docs.notaFiscal.size }] : []),
        ...docs.outros.map(f => ({ name: f.name, type: 'outro', size: f.size })),
      ],
    };
    addExpense(expense);
    toast.success('Despesa salva com sucesso!');
    setForm({ description: '', category: '', value: '', dueDate: '', paymentDate: '', paid: false, costCenter: '', notes: '' });
    setDocs({ contrato: null, notaFiscal: null, outros: [] });
  };

  const formatFileSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="glass-card p-6 max-w-3xl">
      <h2 className="text-lg font-semibold mb-6">Lançar Despesa</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Descrição da despesa *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-secondary"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Data de vencimento *</Label>
            <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Data de pagamento</Label>
            <Input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Centro de Custo</Label>
            <Input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))} className="bg-secondary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.paid} onCheckedChange={v => setForm(f => ({ ...f, paid: v }))} />
          <Label>Pago</Label>
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-secondary" />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">Documentos</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`contract-${companyId}`)?.click()}>
                <FileText className="h-4 w-4 mr-2" /> Upload Contrato
              </Button>
              <input id={`contract-${companyId}`} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setDocs(d => ({ ...d, contrato: e.target.files?.[0] || null }))} />
              {docs.contrato && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{docs.contrato.name} ({formatFileSize(docs.contrato.size)})</span><X className="h-3 w-3 cursor-pointer" onClick={() => setDocs(d => ({ ...d, contrato: null }))} /></div>}
            </div>
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`nf-${companyId}`)?.click()}>
                <Receipt className="h-4 w-4 mr-2" /> Upload Nota Fiscal
              </Button>
              <input id={`nf-${companyId}`} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => setDocs(d => ({ ...d, notaFiscal: e.target.files?.[0] || null }))} />
              {docs.notaFiscal && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{docs.notaFiscal.name} ({formatFileSize(docs.notaFiscal.size)})</span><X className="h-3 w-3 cursor-pointer" onClick={() => setDocs(d => ({ ...d, notaFiscal: null }))} /></div>}
            </div>
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`outros-${companyId}`)?.click()}>
                <Paperclip className="h-4 w-4 mr-2" /> Outros Documentos
              </Button>
              <input id={`outros-${companyId}`} type="file" multiple className="hidden" onChange={e => setDocs(d => ({ ...d, outros: [...d.outros, ...Array.from(e.target.files || [])] }))} />
              {docs.outros.map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><span>{f.name}</span><X className="h-3 w-3 cursor-pointer" onClick={() => setDocs(d => ({ ...d, outros: d.outros.filter((_, j) => j !== i) }))} /></div>)}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar Despesa</Button>
          <Button type="button" variant="outline" onClick={() => setForm({ description: '', category: '', value: '', dueDate: '', paymentDate: '', paid: false, costCenter: '', notes: '' })}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
