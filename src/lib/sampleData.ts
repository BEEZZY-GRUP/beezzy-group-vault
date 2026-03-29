import { Expense, Revenue, CompanySettings, CompanyId } from './types';
import { generateId } from './formatters';

const now = new Date();
const month = (offset: number) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - offset);
  return d.toISOString().split('T')[0];
};

export const defaultSettings: CompanySettings[] = [
  { id: 'beezzy', name: 'Beezzy', cnpj: '12.345.678/0001-01', taxRegime: 'Lucro Presumido', taxRate: 15, customCategories: [], currency: 'BRL' },
  { id: 'palpita', name: 'Palpita.io', cnpj: '23.456.789/0001-02', taxRegime: 'Lucro Presumido', taxRate: 13.5, customCategories: [], currency: 'BRL' },
  { id: 'starmind', name: 'Starmind', cnpj: '34.567.890/0001-03', taxRegime: 'Simples Nacional', taxRate: 6, customCategories: [], currency: 'BRL' },
];

function makeExpenses(company: CompanyId, rate: number): Expense[] {
  const base = company === 'beezzy' ? 8000 : company === 'palpita' ? 5000 : 3000;
  return [
    { id: generateId(), company, description: 'Salários e encargos', category: 'Folha de Pagamento', value: base * 2, dueDate: month(0), status: 'pago', paymentDate: month(0), documents: [] },
    { id: generateId(), company, description: 'Google Ads', category: 'Marketing', value: base * 0.5, dueDate: month(0), status: 'pendente', documents: [] },
    { id: generateId(), company, description: 'AWS / Infraestrutura', category: 'Infraestrutura', value: base * 0.3, dueDate: month(0), status: 'pendente', documents: [] },
    { id: generateId(), company, description: 'Consultoria jurídica', category: 'Serviços', value: base * 0.2, dueDate: month(-1), status: 'vencido', documents: [] },
  ];
}

function makeRevenues(company: CompanyId, taxRate: number): Revenue[] {
  const base = company === 'beezzy' ? 45000 : company === 'palpita' ? 28000 : 15000;
  const months = [0, 1, 2, 3, 4, 5];
  return months.map((m) => {
    const variation = 1 + (Math.random() * 0.3 - 0.15);
    const gross = Math.round(base * variation);
    const tax = Math.round(gross * taxRate / 100);
    return {
      id: generateId(),
      company,
      description: m === 0 ? 'Licenças SaaS' : `Receita ${new Date(now.getFullYear(), now.getMonth() - m).toLocaleDateString('pt-BR', { month: 'short' })}`,
      client: ['Empresa ABC', 'Tech Corp', 'StartupXYZ', 'Digital LTDA'][m % 4],
      grossValue: gross,
      taxAmount: tax,
      netValue: gross - tax,
      saleDate: month(m),
      paymentMethod: ['PIX', 'Boleto', 'Cartão de Crédito', 'Transferência'][m % 4],
      quantity: Math.floor(Math.random() * 20) + 5,
      documents: [],
    };
  });
}

export const defaultExpenses: Expense[] = [];

export const defaultRevenues: Revenue[] = [];
