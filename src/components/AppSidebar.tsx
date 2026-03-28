import { Home, Settings, LogOut } from 'lucide-react';
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

const mainItems = [
  { title: 'Visão Geral do Grupo', url: '/', icon: '🏠', lucideIcon: Home },
];

const companyItems = [
  { title: 'Beezzy', url: '/company/beezzy', icon: COMPANY_INFO.beezzy.icon },
  { title: 'Palpita.io', url: '/company/palpita', icon: COMPANY_INFO.palpita.icon },
  { title: 'Starmind', url: '/company/starmind', icon: COMPANY_INFO.starmind.icon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2 border-b border-border/50 mb-2">
          <span className="text-2xl">🐝</span>
          {!collapsed && <span className="font-bold text-sm tracking-tight text-foreground">BEEZZY GROUP</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end activeClassName="bg-primary/10 text-primary">
                      <span className="mr-2">{item.icon}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Empresas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {companyItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} activeClassName="bg-primary/10 text-primary">
                      <span className="mr-2">{item.icon}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" end activeClassName="bg-primary/10 text-primary">
                    <Settings className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && 'Sair'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
