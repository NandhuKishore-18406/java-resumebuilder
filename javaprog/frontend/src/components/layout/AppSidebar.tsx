"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  FileText, 
  Award, 
  GraduationCap, 
  FolderOpen, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Globe
} from "lucide-react";

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
  { id: "portfolio", icon: Globe, label: "Portfolio", href: "/portfolio" },
  { id: "certificates", icon: Award, label: "Certificates", href: "/certificates" },
  { id: "seminars", icon: GraduationCap, label: "Seminars", href: "/seminars" },
  { id: "file-manager", icon: FolderOpen, label: "File Manager", href: "/file-manager" },
];

interface AppSidebarProps {
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ 
  onLogout, 
  mobileOpen = false, 
  onMobileOpenChange,
  isCollapsed = false,
  onToggleCollapse
}: AppSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileOpenChange?.(false);
  }, [pathname]);

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-background/85 backdrop-blur-xl font-sans select-none">
        {/* Sidebar Header: Name Removed, Shrink Toggle Added */}
        <div className={`flex items-center border-b border-border/50 p-3.5 ${collapsed ? "justify-center" : "justify-between"}`}>
          {isMobile ? (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg ml-auto"
                onClick={() => onMobileOpenChange?.(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand menu" : "Shrink menu"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${collapsed ? "justify-center px-0" : ""}
                  ${isActive
                    ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary border-l-4 border-primary shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }
                `}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        {onLogout && (
          <div className="p-3 border-t border-border/50">
            <Button
              variant="ghost"
              title={collapsed ? "Logout" : undefined}
              className={`
                w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all font-semibold
                ${collapsed ? "justify-center px-0" : "justify-start"}
              `}
              onClick={onLogout}
            >
              <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-3"} flex-shrink-0`} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile: Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0 border-r border-white/20 dark:border-white/10 bg-background/85 backdrop-blur-xl">
          {renderSidebarContent(true)}
        </SheetContent>
      </Sheet>

      {/* Desktop: Shrinkable / Collapsible Sidebar */}
      <aside 
        className={`
          hidden lg:flex fixed left-0 top-16 bottom-0 flex-col border-r border-white/20 dark:border-white/10 bg-background/70 backdrop-blur-xl z-10 shadow-sm shadow-primary/5
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
        `}
      >
        {renderSidebarContent(false)}
      </aside>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2 rounded-xl bg-background/60 backdrop-blur-md" onClick={onClick}>
      <Menu className="h-4 w-4" />
      <span>Menu</span>
    </Button>
  );
}