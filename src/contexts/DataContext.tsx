import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Expense, Revenue, CompanySettings, CompanyId } from '@/lib/types';
import { defaultExpenses, defaultRevenues, defaultSettings } from '@/lib/sampleData';

interface DataContextType {
  expenses: Expense[];
  revenues: Revenue[];
  settings: CompanySettings[];
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  addRevenue: (r: Revenue) => void;
  updateRevenue: (r: Revenue) => void;
  deleteRevenue: (id: string) => void;
  updateSettings: (s: CompanySettings) => void;
  getCompanyExpenses: (c: CompanyId) => Expense[];
  getCompanyRevenues: (c: CompanyId) => Revenue[];
  getCompanySettings: (c: CompanyId) => CompanySettings;
}

const DataContext = createContext<DataContextType | null>(null);

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadJSON('beezzy_expenses', defaultExpenses));
  const [revenues, setRevenues] = useState<Revenue[]>(() => loadJSON('beezzy_revenues', defaultRevenues));
  const [settings, setSettings] = useState<CompanySettings[]>(() => loadJSON('beezzy_settings', defaultSettings));

  useEffect(() => { localStorage.setItem('beezzy_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('beezzy_revenues', JSON.stringify(revenues)); }, [revenues]);
  useEffect(() => { localStorage.setItem('beezzy_settings', JSON.stringify(settings)); }, [settings]);

  const addExpense = useCallback((e: Expense) => setExpenses(prev => [...prev, e]), []);
  const updateExpense = useCallback((e: Expense) => setExpenses(prev => prev.map(x => x.id === e.id ? e : x)), []);
  const deleteExpense = useCallback((id: string) => setExpenses(prev => prev.filter(x => x.id !== id)), []);
  const addRevenue = useCallback((r: Revenue) => setRevenues(prev => [...prev, r]), []);
  const updateSettings = useCallback((s: CompanySettings) => setSettings(prev => prev.map(x => x.id === s.id ? s : x)), []);

  const getCompanyExpenses = useCallback((c: CompanyId) => expenses.filter(e => e.company === c), [expenses]);
  const getCompanyRevenues = useCallback((c: CompanyId) => revenues.filter(r => r.company === c), [revenues]);
  const getCompanySettings = useCallback((c: CompanyId) => settings.find(s => s.id === c)!, [settings]);

  return (
    <DataContext.Provider value={{
      expenses, revenues, settings,
      addExpense, updateExpense, deleteExpense,
      addRevenue, updateSettings,
      getCompanyExpenses, getCompanyRevenues, getCompanySettings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
