
import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCircle } from "lucide-react";

const MainNav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Projects", href: "/projects" },
    { name: "Submit Report", href: "/submit-report" },
    { name: "Manage Options", href: "/manage-options" },
  ];

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Project Manager
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "transition-colors hover:text-foreground/80",
                isActive ? "text-foreground" : "text-foreground/60"
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export function Navigation() {
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <MainNav />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6" />
                  <span className="text-sm mr-2">{user.email}</span>
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
            </nav>
          </div>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
