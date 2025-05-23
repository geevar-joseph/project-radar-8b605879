
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
import MonthlyReportDetail from "./pages/MonthlyReportDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ManageOptions from "./pages/ManageOptions";

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
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Layout with sidebar navigation */}
            <Route path="/" element={<Navigation />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="submit-report" element={<SubmitReport />} />
              <Route path="project/:id" element={<ProjectDetail />} />
              <Route path="report/:reportId" element={<MonthlyReportDetail />} />
              <Route path="manage-options" element={<ManageOptions />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </QueryClientProvider>
);

export default App;
