import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { CompanyId, COMPANY_INFO } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyDashboard } from '@/components/company/CompanyDashboard';
import { ExpenseForm } from '@/components/company/ExpenseForm';
import { RevenueForm } from '@/components/company/RevenueForm';
import { AccountsPayable } from '@/components/company/AccountsPayable';
import { Reports } from '@/components/company/Reports';
import { FinancialSettings } from '@/components/company/FinancialSettings';

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const company = companyId as CompanyId;
  const info = COMPANY_INFO[company];

  if (!info) return <div>Empresa não encontrada</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{info.icon}</span>
        <h1 className="text-2xl font-bold">{info.name}</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-secondary/50 border border-border/50">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expense">Lançar Despesa</TabsTrigger>
          <TabsTrigger value="revenue">Lançar Faturamento</TabsTrigger>
          <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="settings">Config. Financeiras</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><CompanyDashboard companyId={company} /></TabsContent>
        <TabsContent value="expense"><ExpenseForm companyId={company} /></TabsContent>
        <TabsContent value="revenue"><RevenueForm companyId={company} /></TabsContent>
        <TabsContent value="payable"><AccountsPayable companyId={company} /></TabsContent>
        <TabsContent value="reports"><Reports companyId={company} /></TabsContent>
        <TabsContent value="settings"><FinancialSettings companyId={company} /></TabsContent>
      </Tabs>
    </div>
  );
}
