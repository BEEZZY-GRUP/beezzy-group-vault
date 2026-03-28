import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, TAX_REGIMES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Plus, AlertCircle } from 'lucide-react';

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
    updateSettings({
      ...settings,
      cnpj,
      taxRegime,
      taxRate: parseFloat(taxRate) || 0,
      customCategories: customCats,
    });
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="glass-card p-6 max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">Configurações Financeiras</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nome da empresa</Label>
          <Input value={settings.name} readOnly className="bg-muted cursor-not-allowed" />
        </div>

        <div className="space-y-2">
          <Label>CNPJ</Label>
          <Input value={cnpj} onChange={e => setCnpj(e.target.value)} className="bg-secondary" />
        </div>

        <div className="space-y-2">
          <Label>Regime tributário</Label>
          <Select value={taxRegime} onValueChange={setTaxRegime}>
            <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TAX_REGIMES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Alíquota de Imposto (%)</Label>
          <Input type="number" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="bg-secondary" />
        </div>

        <div className="space-y-2">
          <Label>Categorias de despesa personalizadas</Label>
          <div className="flex gap-2">
            <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nova categoria" className="bg-secondary" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
            <Button type="button" variant="outline" size="icon" onClick={addCategory}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {customCats.map(c => (
              <Badge key={c} variant="secondary" className="gap-1">
                {c}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setCustomCats(customCats.filter(x => x !== c))} />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Moeda</Label>
          <Input value="BRL" readOnly className="bg-muted cursor-not-allowed" />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          A alíquota configurada aqui será aplicada automaticamente em todos os lançamentos de faturamento desta empresa.
        </p>
      </div>

      <Button onClick={handleSave}>Salvar Configurações</Button>
    </div>
  );
}
