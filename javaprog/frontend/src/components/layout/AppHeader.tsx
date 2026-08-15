"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User } from "lucide-react";

interface AppHeaderProps {
  onLogout?: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-background/75 backdrop-blur-xl shadow-sm shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#12708c] via-[#0f5c73] to-[#1a8bad] flex items-center justify-center text-white shadow-md shadow-[#12708c]/25">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
                Academic Resume Builder
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Automated Profile & Resume Platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-xs font-semibold text-primary">
              <User className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
          )}
          {onLogout && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout} 
              className="gap-1.5 rounded-lg border-primary/20 bg-background/50 backdrop-blur-md hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}