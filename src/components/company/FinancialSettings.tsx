import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { CompanyId, TAX_REGIMES } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function FinancialSettings({ companyId }: { companyId: CompanyId }) {
  const { getCompanySettings, updateSettings } = useData();
  const settings = getCompanySettings(companyId);

  const [cnpj, setCnpj] = useState(settings.cnpj);
  const [taxRegime, setTaxRegime] = useState(settings.taxRegime);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());

  const handleSave = () => {
    updateSettings({ ...settings, cnpj, taxRegime, taxRate: parseFloat(taxRate) || 0 });
    toast.success('Configurações salvas com sucesso');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[600px]">
      {/* Notice */}
      <div className="border-l-[3px] border-l-primary bg-primary/[0.12] rounded-r-[6px] px-4 py-3 mb-5 text-xs text-muted-foreground leading-relaxed">
        A alíquota configurada aqui será aplicada automaticamente em todos os lançamentos de faturamento desta empresa.
      </div>

      <div className="space-y-7">
        {/* Dados da Empresa */}
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] mb-3.5 pb-2 border-b border-border font-medium">
            Dados da Empresa
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Nome da Empresa</label>
              <input readOnly value={settings.name}
                className="w-full bg-secondary/50 border border-input/50 rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground cursor-not-allowed outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">CNPJ</label>
              <input value={cnpj} onChange={e => setCnpj(e.target.value)}
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Regime Tributário</label>
              <select value={taxRegime} onChange={e => setTaxRegime(e.target.value)}
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-muted-foreground outline-none focus:border-primary transition-colors">
                {TAX_REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Alíquota de Imposto (%)</label>
              <input type="number" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-primary font-medium outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Caixas */}
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] mb-3.5 pb-2 border-b border-border font-medium">
            Caixas Estratégicos
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Meta Caixa Emergência (R$)</label>
              <input type="number" defaultValue="150000"
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Meta Caixa Investimento (R$)</label>
              <input type="number" defaultValue="300000"
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Dia Distribuição Dividendos</label>
              <input type="number" min="1" max="28" defaultValue="28"
                className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Moeda</label>
              <input readOnly value="BRL"
                className="w-full bg-secondary/50 border border-input/50 rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground cursor-not-allowed outline-none" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-[10px] accent-gradient rounded-[6px] font-display text-[13px] font-semibold text-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Salvar Configurações
        </button>
      </div>
    </motion.div>
  );
}
