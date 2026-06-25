import { Outlet } from "@tanstack/react-router";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { Toaster } from "sonner";
export function AppLayout() {
  return (
    <div className="flex h-screen bg-background w-full transition-colors duration-300 font-sans text-foreground">
      <Toaster />
      <SidebarNav />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        <main className="flex-1 overflow-auto relative p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
