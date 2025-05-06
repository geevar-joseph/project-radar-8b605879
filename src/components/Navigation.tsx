
import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCircle, Menu } from "lucide-react";

export function Navigation() {
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <LeftSidebar />
        <div className="flex-1">
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <SidebarTrigger />
              <div className="flex flex-1 items-center justify-between">
                <Link to="/" className="flex items-center">
                  <span className="text-lg font-bold ml-2">Project Manager</span>
                </Link>

                {user ? (
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-6 w-6 hidden sm:block" />
                    <span className="text-sm mr-2 hidden sm:block">{user.email}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
