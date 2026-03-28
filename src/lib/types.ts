export type CompanyId = 'beezzy' | 'palpita' | 'starmind';

export interface CompanySettings {
  id: CompanyId;
  name: string;
  cnpj: string;
  taxRegime: string;
  taxRate: number;
  customCategories: string[];
  currency: string;
}

export interface Expense {
  id: string;
  company: CompanyId;
  description: string;
  category: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pendente' | 'pago' | 'vencido';
  costCenter?: string;
  notes?: string;
  documents: DocFile[];
}

export interface Revenue {
  id: string;
  company: CompanyId;
  description: string;
  client: string;
  grossValue: number;
  taxAmount: number;
  netValue: number;
  saleDate: string;
  paymentMethod: string;
  quantity: number;
  notes?: string;
  documents: DocFile[];
}

export interface DocFile {
  name: string;
  type: string;
  size: number;
}

export const COMPANY_INFO: Record<CompanyId, { name: string; icon: string; color: string }> = {
  beezzy: { name: 'Beezzy', icon: '🐝', color: '#F59E0B' },
  palpita: { name: 'Palpita.io', icon: '🎯', color: '#EF4444' },
  starmind: { name: 'Starmind', icon: '🌟', color: '#8B5CF6' },
};

export const DEFAULT_CATEGORIES = [
  'Folha de Pagamento',
  'Marketing',
  'Infraestrutura',
  'Serviços',
  'Fornecedores',
  'Outros',
];

export const PAYMENT_METHODS = [
  'PIX',
  'Boleto',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência',
  'Outros',
];

export const TAX_REGIMES = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
];
