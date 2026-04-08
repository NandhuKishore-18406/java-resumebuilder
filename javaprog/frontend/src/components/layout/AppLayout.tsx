"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "./AppHeader";
import { AppSidebar, SidebarTrigger } from "./AppSidebar";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <AppHeader onLogout={handleLogout} />
      <div className="flex">
        {showSidebar && <AppSidebar onLogout={handleLogout} />}
        <main className={`flex-1 transition-all ${showSidebar ? "lg:ml-64" : ""}`}>
          <div className="lg:hidden p-4 border-b bg-background">
            <SidebarTrigger onClick={() => {/* Mobile sidebar handled by Sheet */}} />
          </div>
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}