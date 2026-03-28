import { useData } from '@/contexts/DataContext';
import { COMPANY_INFO, CompanyId } from '@/lib/types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { settings } = useData();
  const navigate = useNavigate();

  const companies = (['beezzy', 'palpita', 'starmind'] as CompanyId[]).map(id => {
    const s = settings.find(s => s.id === id)!;
    return { ...s, ...COMPANY_INFO[id] };
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <h1 className="font-display text-xl font-semibold tracking-[-0.02em]">Configurações do Sistema</h1>
      <p className="text-xs text-muted-foreground mt-1 mb-6">Gerencie as configurações globais da plataforma</p>

      <div className="max-w-[600px] space-y-7">
        {/* Account */}
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] mb-3.5 pb-2 border-b border-border font-medium">
            Conta de Acesso
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Usuário</label>
              <input className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none" defaultValue="beezzygroup" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-[0.07em] block mb-1.5">Nova Senha</label>
              <input type="password" className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-[13px] text-foreground outline-none" placeholder="••••••••" />
            </div>
          </div>
        </div>

        {/* Companies */}
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] mb-3.5 pb-2 border-b border-border font-medium">
            Empresas do Grupo
          </div>
          {companies.map(c => (
            <div key={c.id} className="flex justify-between items-center py-3 border-b border-border">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">{c.taxRegime} · Alíquota {c.taxRate}%</div>
              </div>
              <button
                onClick={() => navigate(`/company/${c.id}`)}
                className="px-5 py-2.5 border border-input rounded-[6px] text-[11px] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                Acessar
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => toast.success('Configurações salvas')}
          className="px-6 py-[10px] accent-gradient rounded-[6px] font-display text-[13px] font-semibold text-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Salvar
        </button>
      </div>
    </motion.div>
  );
}
