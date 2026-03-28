import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DateFilterBar, DateFilterState, getDefaultFilterState } from '@/components/DateFilterBar';
import { Download, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Visão Geral',
  '/settings': 'Configurações',
};

function getBreadcrumb(pathname: string) {
  if (BREADCRUMB_MAP[pathname]) return { parent: 'Grupo', label: BREADCRUMB_MAP[pathname] };
  const match = pathname.match(/\/company\/(\w+)/);
  if (match) {
    const names: Record<string, string> = { beezzy: 'Beezzy', palpita: 'Palpita.io', starmind: 'Starmind' };
    return { parent: 'Empresa', label: names[match[1]] || match[1] };
  }
  return { parent: 'Grupo', label: 'Página' };
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useAuth();
  const bc = getBreadcrumb(location.pathname);
  const [dateFilter, setDateFilter] = useState<DateFilterState>(getDefaultFilterState);

  const showDateFilter = location.pathname !== '/settings';

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="h-[52px] bg-[hsl(0_0%_2.7%)] border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-muted-foreground">{bc.parent}</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-medium">{bc.label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => toast.info('Exportação disponível na versão completa')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-[7px] text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-[11px] h-[11px]" />
                Exportar
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-[7px] text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-[11px] h-[11px]" />
                Sair
              </button>
            </div>
          </div>

          {/* Date filter bar */}
          {showDateFilter && (
            <DateFilterBar value={dateFilter} onChange={setDateFilter} />
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-7">
            {typeof children === 'function'
              ? (children as any)(dateFilter)
              : children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
