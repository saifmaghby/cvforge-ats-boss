import {
  FileText,
  ScanSearch,
  PenTool,
  Settings,
  LogOut,
  Target,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "My CVs", url: "/dashboard", icon: FileText },
  { title: "CV Builder", url: "/builder", icon: PenTool },
  { title: "ATS Checker", url: "/ats-checker", icon: ScanSearch },
  { title: "Job Tracker", url: "/job-tracker", icon: Target },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          {!collapsed ? (
            <a href="/dashboard" className="font-display text-lg font-bold uppercase tracking-tight text-sidebar-foreground">
              CV<span className="text-sidebar-primary">Forge</span>
            </a>
          ) : (
            <a href="/dashboard" className="font-display text-lg font-bold text-sidebar-primary mx-auto">
              C
            </a>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-sidebar-foreground/40 px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-4 py-2 font-mono text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <p className="text-[10px] font-mono text-sidebar-foreground/40 truncate mb-2 px-1">
            {user?.email}
          </p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip="Sign Out"
              className="flex items-center gap-3 px-4 py-2 font-mono text-sm text-sidebar-foreground/50 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
