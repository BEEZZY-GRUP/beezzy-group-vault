import { useParams } from 'react-router-dom';
import { CompanyId, COMPANY_INFO } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyDashboard } from '@/components/company/CompanyDashboard';
import { ExpenseForm } from '@/components/company/ExpenseForm';
import { RevenueForm } from '@/components/company/RevenueForm';
import { AccountsPayable } from '@/components/company/AccountsPayable';
import { Reports } from '@/components/company/Reports';
import { FinancialSettings } from '@/components/company/FinancialSettings';
import { motion } from 'framer-motion';
import { LayoutDashboard, CreditCard, TrendingUp, FileText, BarChart3, Settings } from 'lucide-react';

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

  if (!info) return <div className="text-muted-foreground">Empresa não encontrada</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-2xl">{info.icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{info.name}</h1>
          <p className="text-sm text-muted-foreground">Gestão financeira</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-secondary/30 border border-border/30 p-1 h-auto flex-wrap">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border-primary/20 border border-transparent text-muted-foreground gap-2 px-4 py-2 text-xs font-medium transition-all"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard"><CompanyDashboard companyId={company} /></TabsContent>
        <TabsContent value="expense"><ExpenseForm companyId={company} /></TabsContent>
        <TabsContent value="revenue"><RevenueForm companyId={company} /></TabsContent>
        <TabsContent value="payable"><AccountsPayable companyId={company} /></TabsContent>
        <TabsContent value="reports"><Reports companyId={company} /></TabsContent>
        <TabsContent value="settings"><FinancialSettings companyId={company} /></TabsContent>
      </Tabs>
    </motion.div>
  );
}
