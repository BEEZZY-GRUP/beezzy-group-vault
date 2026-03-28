import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center border-b border-border/40 px-5 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Sistema ativo</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
