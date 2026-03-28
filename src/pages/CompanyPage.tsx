import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CompanyId, COMPANY_INFO } from '@/lib/types';
import { CompanyDashboard } from '@/components/company/CompanyDashboard';
import { ExpenseForm } from '@/components/company/ExpenseForm';
import { RevenueForm } from '@/components/company/RevenueForm';
import { AccountsPayable } from '@/components/company/AccountsPayable';
import { Reports } from '@/components/company/Reports';
import { FinancialSettings } from '@/components/company/FinancialSettings';
import { motion } from 'framer-motion';
import { LayoutDashboard, CreditCard, TrendingUp, FileText, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'expense', label: 'Lançar Despesa', icon: CreditCard },
  { value: 'revenue', label: 'Lançar Faturamento', icon: TrendingUp },
  { value: 'payable', label: 'Contas a Pagar', icon: FileText },
  { value: 'reports', label: 'Relatórios', icon: BarChart3 },
  { value: 'settings', label: 'Configurações', icon: Settings },
];

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const company = companyId as CompanyId;
  const info = COMPANY_INFO[company];
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!info) return <div className="text-muted-foreground">Empresa não encontrada</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <CompanyDashboard companyId={company} />;
      case 'expense': return <ExpenseForm companyId={company} />;
      case 'revenue': return <RevenueForm companyId={company} />;
      case 'payable': return <AccountsPayable companyId={company} />;
      case 'reports': return <Reports companyId={company} />;
      case 'settings': return <FinancialSettings companyId={company} />;
      default: return <CompanyDashboard companyId={company} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6 min-h-[calc(100vh-5rem)]"
    >
      {/* Left sidebar nav */}
      <div className="w-56 shrink-0">
        <div className="sticky top-20 space-y-1">
          {/* Company header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xl">{info.icon}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight truncate">{info.name}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Financeiro</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-0.5">
            {tabs.map(tab => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 text-primary/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </motion.div>
  );
}
