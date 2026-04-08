"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onLogout?: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 border-2 border-foreground flex items-center justify-center relative">
              <div className="absolute h-[18px] w-[1px] bg-foreground" />
              <div className="absolute w-[18px] h-[1px] bg-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-heading leading-tight">Resume Builder</h1>
              <p className="text-xs text-muted-foreground italic">auto update and generation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-sm text-muted-foreground">
            {user?.email}
          </span>
          {onLogout && (
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}