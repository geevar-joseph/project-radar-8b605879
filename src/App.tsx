
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ProjectProvider } from "./context/ProjectContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SubmitReport from "./pages/SubmitReport";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Protected routes with Navigation */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/dashboard"
              element={
                <>
                  <Navigation />
                  <Dashboard />
                </>
              }
            />
            <Route
              path="/submit-report"
              element={
                <>
                  <Navigation />
                  <SubmitReport />
                </>
              }
            />
            <Route
              path="/project/:id"
              element={
                <>
                  <Navigation />
                  <ProjectDetail />
                </>
              }
            />
            <Route
              path="/manage-options"
              element={
                <>
                  <Navigation />
                  <Index />
                </>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </QueryClientProvider>
);

export default App;
