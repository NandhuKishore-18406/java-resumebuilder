"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, User, FileText, Award, GraduationCap, FolderOpen, LogOut } from "lucide-react";

export interface SidebarItem {
  id: string;
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "profile", icon: User, label: "Profile", href: "/profile" },
  { id: "resume-builder", icon: FileText, label: "Resume Builder", href: "/resume-builder" },
  { id: "certificates", icon: Award, label: "Certificates", href: "/certificates" },
  { id: "seminars", icon: GraduationCap, label: "Seminars", href: "/seminars" },
  { id: "file-manager", icon: FolderOpen, label: "File Manager", href: "/file-manager" },
];

interface AppSidebarProps {
  onLogout?: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold text-sm">Menu</span>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-accent text-accent-foreground border-l-4 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col border-r bg-background z-10">
        {renderSidebarContent()}
      </aside>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}