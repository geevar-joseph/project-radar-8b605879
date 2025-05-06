
import { useState, useEffect } from "react";
import { ProjectReport } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import { fetchDashboardReports, fetchAllReportingPeriods, mapToProjectReport } from "@/api/projectApi";
import { fetchProjects } from "@/api/projectsApi";

/**
 * Hook for dashboard-specific data
 * Returns data filtered by period for the dashboard without affecting the project list
 */
export const useDashboardData = () => {
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const { toast } = useToast();

  // Load all available periods when component mounts
  useEffect(() => {
    loadAllPeriods();
  }, []);

  // Load dashboard data whenever selected period changes
  useEffect(() => {
    if (selectedPeriod) {
      loadDashboardData(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Load all reporting periods
  const loadAllPeriods = async () => {
    try {
      const periods = await fetchAllReportingPeriods();
      console.log('Dashboard - All available reporting periods:', periods);
      setAvailablePeriods(periods);
      
      // Auto-select the latest period if none is selected
      if (periods.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periods[0]); // Periods are already sorted in descending order
      }
    } catch (error) {
      console.error('Error loading periods for dashboard:', error);
      setIsError(true);
    }
  };

  // Load dashboard data for the selected period
  const loadDashboardData = async (period: string) => {
    setIsLoading(true);
    
    try {
      // Fetch all projects (to get project names and count total projects)
      const { projectsData, error: projectsError } = await fetchProjects();
      
      if (projectsError) throw projectsError;
      
      // Extract project names
      const names = projectsData.map(project => project.project_name);
      setProjectNames(Array.from(new Set(names))); // Remove duplicates
      
      console.log(`Dashboard - Loading data for period ${period}`);
      
      // Fetch reports for the selected period
      const { reportsData, error: reportsError } = await fetchDashboardReports(period);
      
      if (reportsError) throw reportsError;
      
      // Map the raw data to ProjectReport objects
      const formattedReports: ProjectReport[] = reportsData.map(report => {
        return mapToProjectReport(report);
      });
      
      console.log(`Dashboard - Found ${formattedReports.length} reports for period ${period}`);
      setReports(formattedReports);
      setIsError(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
      setReports([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Get project reports for the dashboard
  const getDashboardReports = (period?: string) => {
    if (!period) return reports;
    return reports.filter(report => report.reportingPeriod === period);
  };

  return {
    reports,
    projectNames,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    isLoading,
    isError,
    getDashboardReports,
    loadDashboardData
  };
};
