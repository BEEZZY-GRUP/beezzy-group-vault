import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CompanyId, COMPANY_INFO } from '@/lib/types';
import { CompanyDashboard } from '@/components/company/CompanyDashboard';
import { ExpenseForm } from '@/components/company/ExpenseForm';
import { RevenueForm } from '@/components/company/RevenueForm';
import { AccountsPayable } from '@/components/company/AccountsPayable';
import { RevenueList } from '@/components/company/RevenueList';
import { Reports } from '@/components/company/Reports';
import { FinancialSettings } from '@/components/company/FinancialSettings';
import { motion } from 'framer-motion';
import { useDateFilter } from '@/hooks/useDateFilter';

const tabs = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'expense', label: 'Lançar Despesa' },
  { value: 'revenue', label: 'Lançar Faturamento' },
  { value: 'payable', label: 'Contas a Pagar' },
  { value: 'revenues', label: 'Faturamentos' },
  { value: 'reports', label: 'Relatórios' },
  { value: 'settings', label: 'Config. Financeiras' },
];

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const company = companyId as CompanyId;
  const info = COMPANY_INFO[company];
  const [activeTab, setActiveTab] = useState('dashboard');
  const dateFilter = useDateFilter();

  if (!info) return <div className="text-muted-foreground">Empresa não encontrada</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <CompanyDashboard companyId={company} dateFilter={dateFilter} />;
      case 'expense': return <ExpenseForm companyId={company} />;
      case 'revenue': return <RevenueForm companyId={company} />;
      case 'payable': return <AccountsPayable companyId={company} dateFilter={dateFilter} />;
      case 'revenues': return <RevenueList companyId={company} dateFilter={dateFilter} />;
      case 'reports': return <Reports companyId={company} dateFilter={dateFilter} />;
      case 'settings': return <FinancialSettings companyId={company} />;
      default: return <CompanyDashboard companyId={company} dateFilter={dateFilter} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="font-display text-xl font-semibold tracking-[-0.02em]">{info.name}</div>
      <p className="text-xs text-muted-foreground mt-1 mb-5">{info.name} — {dateFilter.label}</p>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-[18px] py-2.5 text-xs whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.value
                ? 'text-primary border-b-primary font-medium'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}
