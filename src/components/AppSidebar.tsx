import { Home, Settings, LogOut, Building2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_INFO } from '@/lib/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const companyItems = [
  { title: 'Beezzy', url: '/company/beezzy', icon: COMPANY_INFO.beezzy.icon, color: COMPANY_INFO.beezzy.color },
  { title: 'Palpita.io', url: '/company/palpita', icon: COMPANY_INFO.palpita.icon, color: COMPANY_INFO.palpita.color },
  { title: 'Starmind', url: '/company/starmind', icon: COMPANY_INFO.starmind.icon, color: COMPANY_INFO.starmind.color },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar-background">
        {/* Brand */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-lg">🐝</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-foreground block">BEEZZY GROUP</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Finance</span>
            </div>
          )}
        </div>

        <Separator className="mx-3 w-auto bg-border/30" />

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground/60 font-semibold uppercase">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end activeClassName="bg-primary/10 text-primary border-primary/20" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-accent text-muted-foreground border border-transparent">
                    <Home className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Visão Geral</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground/60 font-semibold uppercase">Empresas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {companyItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} activeClassName="bg-primary/10 text-primary border-primary/20" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-accent text-muted-foreground border border-transparent">
                      <span className="text-base shrink-0">{item.icon}</span>
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" end activeClassName="bg-primary/10 text-primary border-primary/20" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-accent text-muted-foreground border border-transparent">
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
