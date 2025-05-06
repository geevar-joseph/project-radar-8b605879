
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show loading state if auth is still initializing
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // For admin-only routes, check user role
  if (adminOnly) {
    // Get user metadata
    const metadata = user.user_metadata;
    const role = metadata?.role;
    
    if (role !== 'Admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};
