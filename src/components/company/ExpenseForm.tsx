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
import { FileText, Receipt, Paperclip, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

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
      id: generateId(), company: companyId, description: form.description,
      category: form.category, value: parseFloat(form.value), dueDate: form.dueDate,
      paymentDate: form.paymentDate || undefined, status: form.paid ? 'pago' : 'pendente',
      costCenter: form.costCenter || undefined, notes: form.notes || undefined,
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Lançar Despesa</h2>
        <p className="text-sm text-muted-foreground mt-1">Registre uma nova despesa para esta empresa</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor (R$) *</Label>
            <Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 font-mono focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vencimento *</Label>
            <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pagamento</Label>
            <Input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Centro de Custo</Label>
            <Input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))} className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50" />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
          <Switch checked={form.paid} onCheckedChange={v => setForm(f => ({ ...f, paid: v }))} />
          <Label className="text-sm font-medium">Marcar como pago</Label>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observações</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-secondary/50 border-border/50 min-h-[80px] focus:border-primary/50" />
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documentos</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'contrato', label: 'Contrato', icon: FileText, accept: '.pdf,.doc,.docx', file: docs.contrato },
              { key: 'notaFiscal', label: 'Nota Fiscal', icon: Receipt, accept: '.pdf,.jpg,.png', file: docs.notaFiscal },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <button type="button" onClick={() => document.getElementById(`${item.key}-${companyId}`)?.click()}
                  className="w-full flex items-center gap-2 justify-center py-3 px-4 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <Upload className="h-4 w-4" /> {item.label}
                </button>
                <input id={`${item.key}-${companyId}`} type="file" accept={item.accept} className="hidden"
                  onChange={e => setDocs(d => ({ ...d, [item.key]: e.target.files?.[0] || null }))} />
                {item.file && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                    <item.icon className="h-3 w-3 shrink-0" />
                    <span className="truncate flex-1">{item.file.name}</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors shrink-0"
                      onClick={() => setDocs(d => ({ ...d, [item.key]: null }))} />
                  </div>
                )}
              </div>
            ))}
            <div className="space-y-2">
              <button type="button" onClick={() => document.getElementById(`outros-${companyId}`)?.click()}
                className="w-full flex items-center gap-2 justify-center py-3 px-4 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Paperclip className="h-4 w-4" /> Outros
              </button>
              <input id={`outros-${companyId}`} type="file" multiple className="hidden"
                onChange={e => setDocs(d => ({ ...d, outros: [...d.outros, ...Array.from(e.target.files || [])] }))} />
              {docs.outros.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors shrink-0"
                    onClick={() => setDocs(d => ({ ...d, outros: d.outros.filter((_, j) => j !== i) }))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/30">
          <Button type="submit" className="px-8">Salvar Despesa</Button>
          <Button type="button" variant="outline"
            onClick={() => setForm({ description: '', category: '', value: '', dueDate: '', paymentDate: '', paid: false, costCenter: '', notes: '' })}>
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
