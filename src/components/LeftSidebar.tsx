
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOut, UserCircle, LayoutDashboard, FolderPlus, FileText, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function LeftSidebar() {
  const { user, signOut } = useAuth();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderPlus },
    { name: "Submit Report", href: "/submit-report", icon: FileText },
    { name: "Manage Options", href: "/manage-options", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center px-2 py-4">
          <span className="text-lg font-bold">Project Manager</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "w-full",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm" className="w-full">
              Login
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
