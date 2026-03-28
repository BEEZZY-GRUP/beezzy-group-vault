import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, TAX_REGIMES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Plus, AlertCircle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function FinancialSettings({ companyId }: { companyId: CompanyId }) {
  const { getCompanySettings, updateSettings } = useData();
  const settings = getCompanySettings(companyId);

  const [cnpj, setCnpj] = useState(settings.cnpj);
  const [taxRegime, setTaxRegime] = useState(settings.taxRegime);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [customCats, setCustomCats] = useState(settings.customCategories);
  const [newCat, setNewCat] = useState('');

  const addCategory = () => {
    if (newCat.trim() && !customCats.includes(newCat.trim())) {
      setCustomCats([...customCats, newCat.trim()]);
      setNewCat('');
    }
  };

  const handleSave = () => {
    updateSettings({ ...settings, cnpj, taxRegime, taxRate: parseFloat(taxRate) || 0, customCategories: customCats });
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Configurações Financeiras</h2>
          <p className="text-sm text-muted-foreground">Defina os parâmetros fiscais da empresa</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome da Empresa</Label>
          <Input value={settings.name} readOnly className="bg-secondary/20 border-border/30 h-11 cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CNPJ</Label>
          <Input value={cnpj} onChange={e => setCnpj(e.target.value)} className="bg-secondary/50 border-border/50 h-11 font-mono focus:border-primary/50" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regime Tributário</Label>
          <Select value={taxRegime} onValueChange={setTaxRegime}>
            <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{TAX_REGIMES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alíquota de Imposto (%)</Label>
          <Input type="number" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="bg-secondary/50 border-border/50 h-11 font-mono focus:border-primary/50" />
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categorias Personalizadas</Label>
          <div className="flex gap-2">
            <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nova categoria"
              className="bg-secondary/50 border-border/50 h-11 focus:border-primary/50"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
            <Button type="button" variant="outline" size="icon" onClick={addCategory} className="h-11 w-11 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customCats.map(c => (
              <Badge key={c} variant="secondary" className="gap-1.5 bg-secondary/50 border border-border/30 px-3 py-1.5">
                {c}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => setCustomCats(customCats.filter(x => x !== c))} />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Moeda</Label>
          <Input value="BRL" readOnly className="bg-secondary/20 border-border/30 h-11 cursor-not-allowed" />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          A alíquota configurada aqui será aplicada automaticamente em todos os lançamentos de faturamento desta empresa.
        </p>
      </div>

      <Button onClick={handleSave} className="px-8">Salvar Configurações</Button>
    </motion.div>
  );
}
