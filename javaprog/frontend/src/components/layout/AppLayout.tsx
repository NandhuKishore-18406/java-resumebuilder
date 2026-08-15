"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-gradient">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col font-sans">
      <AppHeader onLogout={handleLogout} />
      <div className="flex flex-1">
        {showSidebar && (
          <AppSidebar
            onLogout={handleLogout}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />
        )}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${showSidebar ? (isCollapsed ? "lg:ml-16" : "lg:ml-64") : ""}`}>
          {showSidebar && (
            <div className="lg:hidden p-4 border-b border-border/50 bg-background/75 backdrop-blur-md flex items-center justify-between">
              <SidebarTrigger onClick={() => setMobileOpen(true)} />
            </div>
          )}
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}