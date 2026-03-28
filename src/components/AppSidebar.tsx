import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_INFO, CompanyId } from '@/lib/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const companies: { id: CompanyId; name: string }[] = [
  { id: 'beezzy', name: 'Beezzy' },
  { id: 'palpita', name: 'Palpita.io' },
  { id: 'starmind', name: 'Starmind' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isCompanyActive = (id: string) => location.pathname.startsWith(`/company/${id}`);

  const navItemClass = (active: boolean) =>
    `flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-[13px] cursor-pointer transition-all border-l-2 mb-0.5 ${
      active
        ? 'text-foreground border-l-primary bg-primary/[0.12]'
        : 'text-muted-foreground border-l-transparent hover:text-foreground hover:bg-[hsl(0_0%_100%/0.03)]'
    }`;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-r border-border">
        {/* Logo */}
        <div className="px-5 pt-6 pb-[18px] border-b border-border">
          {!collapsed ? (
            <>
              <div className="font-display text-base font-bold tracking-[-0.01em]">
                BEEZZY<span className="accent-text">.</span>
              </div>
              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.06em] mt-0.5">
                Finance Group
              </div>
            </>
          ) : (
            <div className="font-display text-base font-bold accent-text">B</div>
          )}
        </div>

        {/* Nav: Visão Geral */}
        <div className="px-3 pt-[18px] pb-1.5">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.1em] px-2 mb-1.5 font-medium">
            Visão Geral
          </div>
          <NavLink to="/" end className={navItemClass(isActive('/'))}>
            <svg className="w-3.5 h-3.5 opacity-50 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
            </svg>
            {!collapsed && 'Grupo'}
          </NavLink>
        </div>

        {/* Nav: Empresas */}
        <div className="px-3 pt-[18px] pb-1.5">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.1em] px-2 mb-1.5 font-medium">
            Empresas
          </div>
          {companies.map(c => (
            <NavLink key={c.id} to={`/company/${c.id}`} className={navItemClass(isCompanyActive(c.id))}>
              <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${
                isCompanyActive(c.id) ? 'bg-primary' : 'bg-[hsl(0_0%_100%/0.15)]'
              }`} />
              {!collapsed && c.name}
            </NavLink>
          ))}
        </div>

        {/* Nav: Sistema */}
        <div className="px-3 pt-[18px] pb-1.5">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.1em] px-2 mb-1.5 font-medium">
            Sistema
          </div>
          <NavLink to="/settings" end className={navItemClass(isActive('/settings'))}>
            <svg className="w-3.5 h-3.5 opacity-50 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M11.9 3.4l-.7.7M4.1 11.9l-.7.7"/>
            </svg>
            {!collapsed && 'Configurações'}
          </NavLink>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 bg-sidebar-background">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] w-full cursor-pointer hover:bg-[hsl(0_0%_100%/0.03)] transition-colors"
        >
          <div className="w-[30px] h-[30px] rounded-full accent-gradient flex items-center justify-center text-[11px] font-bold text-black font-display shrink-0">
            BG
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs text-foreground font-medium">beezzygroup</div>
              <div className="text-[10px] text-muted-foreground/60">Administrador</div>
            </div>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
