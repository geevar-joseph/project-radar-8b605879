import { useState, useEffect, useRef } from "react";
import { ProjectReport } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import { sampleProjects } from "@/data/mockData";
import { fetchProjects, fetchProjectReports, fetchAllReportingPeriods, mapToProjectReport } from "@/api/projectApi";

/**
 * Hook for fetching and managing project data
 */
export const useProjectData = () => {
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const toastShownRef = useRef<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    loadAllPeriods();
  }, []);

  const loadAllPeriods = async () => {
    try {
      const periods = await fetchAllReportingPeriods();
      console.log('All available reporting periods:', periods);
      setAvailablePeriods(periods);
      
      // Auto-select the latest period if none is selected
      if (periods.length > 0 && (!selectedPeriod || selectedPeriod === "N/A")) {
        setSelectedPeriod(periods[0]); // Since periods are already sorted in descending order
      }
    } catch (error) {
      console.error('Error loading all periods:', error);
      // Fall back to standard periods if there's an error
      const periods = getUniqueReportingPeriods();
      setAvailablePeriods(periods);
    }
  };

  const loadProjects = async () => {
    // Prevent multiple simultaneous loading attempts
    if (loadingRef.current) {
      console.log('Already loading projects, skipping duplicate request');
      return;
    }

    setIsLoading(true);
    loadingRef.current = true;
    toastShownRef.current = false;
    
    try {
      // Fetch projects
      const { projectsData, error: projectsError } = await fetchProjects();
      
      if (projectsError) throw projectsError;

      console.log('Projects Data:', projectsData);

      // Extract project names - use Set to eliminate duplicates
      const namesSet = new Set(projectsData.map(project => project.project_name));
      const uniqueNames = Array.from(namesSet);
      setProjectNames(uniqueNames);

      // Fetch project reports
      const { reportsData, error: reportsError } = await fetchProjectReports();
      
      if (reportsError) throw reportsError;

      console.log('Project Reports Data:', reportsData);

      // Create a map to store the latest report for each project
      const latestReportsByProject = new Map<string, any>();
      
      // Process reports to find the latest for each project
      if (reportsData && reportsData.length > 0) {
        // Group reports by project name
        reportsData.forEach(report => {
          const projectName = report.projects?.project_name;
          if (!projectName) return;
          
          // If we don't have this project yet, or this report is newer
          const existingReport = latestReportsByProject.get(projectName);
          if (!existingReport || 
              (new Date(report.submission_date) > new Date(existingReport.submission_date))) {
            latestReportsByProject.set(projectName, report);
          }
        });
      }
      
      // Create a combined dataset from projects and latest reports
      let formattedReports: ProjectReport[] = [];

      // Add all latest project reports
      for (const report of latestReportsByProject.values()) {
        formattedReports.push(mapToProjectReport(report));
      }

      // Add projects that don't have reports yet with default values
      projectsData.forEach(project => {
        const projectName = project.project_name;
        const hasReport = latestReportsByProject.has(projectName);

        if (!hasReport) {
          formattedReports.push({
            id: project.id,
            projectName: projectName,
            clientName: project.client_name || 'N/A',
            projectType: project.project_type as any || 'Service',
            projectStatus: project.project_status as any || 'Active',
            assignedPM: project.team_members?.name || 'N/A',
            jiraId: project.jira_id || undefined,
            submittedBy: 'N/A',
            reportingPeriod: 'N/A',
            riskLevel: 'N.A.' as any,
            financialHealth: 'N.A.' as any,
            completionOfPlannedWork: 'N.A.' as any,
            teamMorale: 'N.A.' as any,
            customerSatisfaction: 'N.A.' as any,
            projectManagerEvaluation: 'N.A.',
            frontEndQuality: 'N.A.',
            backEndQuality: 'N.A.',
            testingQuality: 'N.A.',
            designQuality: 'N.A.',
            submissionDate: project.updated_at
          });
        }
      });
      
      console.log('Combined Formatted Data (Deduplicated):', formattedReports);
      setProjects(formattedReports);
      setIsError(false);
      
      // Now auto-select the latest period if none is selected
      const periods = getUniqueReportingPeriods(formattedReports);
      if (periods.length > 0 && (!selectedPeriod || selectedPeriod === "N/A")) {
        // Get the latest period
        const latestPeriod = periods[0]; // Since periods are already sorted in descending order
        setSelectedPeriod(latestPeriod);
      }
    } catch (error) {
      console.error('Error loading projects data:', error);
      // Only show the error toast once, not repeatedly
      if (!toastShownRef.current && !isError) {
        toast({
          title: "Error",
          description: "Failed to load project data. Using sample data instead.",
          variant: "destructive"
        });
        toastShownRef.current = true;
      }
      
      // Fallback to sample data
      setProjects(sampleProjects);
      setProjectNames(sampleProjects.map(p => p.projectName).filter((value, index, self) => self.indexOf(value) === index));
      setIsError(true);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  /**
   * Get all unique reporting periods from the projects
   * @param projectData Optional parameter to extract periods from specific data
   * @returns Sorted array of reporting periods in descending order (latest first)
   */
  const getUniqueReportingPeriods = (projectData: ProjectReport[] = projects) => {
    // Extract all periods including duplicates
    const allPeriods = projectData
      .map(p => p.reportingPeriod)
      .filter(period => period !== "N/A" && period !== undefined);
    
    // Filter out duplicates by creating a Set and convert back to array
    const uniquePeriods = [...new Set(allPeriods)];
    
    // Sort the periods in descending order (newest first)
    return uniquePeriods.sort((a, b) => {
      // If either is not in YYYY-MM format, compare strings directly
      if (!/^\d{4}-\d{2}$/.test(a) || !/^\d{4}-\d{2}$/.test(b)) {
        return b.localeCompare(a);
      }

      // Parse years and months for proper date comparison
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      
      // First compare years (in descending order)
      if (yearA !== yearB) {
        return yearB - yearA;
      } 
      // If years are the same, compare months (in descending order)
      return monthB - monthA;
    });
  };

  /**
   * Filter projects by reporting period asynchronously
   * This is the original method that returns all projects if no period is specified
   */
  const getFilteredProjects = (period?: string) => {
    if (!period) return projects;
    return projects.filter(project => project.reportingPeriod === period);
  };

  /**
   * Filter projects by reporting period synchronously
   * This is used for real-time filtering in components
   */
  const getFilteredProjectsSync = (period?: string) => {
    if (!period) return projects;
    return projects.filter(project => project.reportingPeriod === period);
  };

  return {
    projects,
    setProjects,
    projectNames,
    setProjectNames,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    isLoading,
    isError,
    loadProjects,
    loadAllPeriods,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects,
    getFilteredProjectsSync
  };
};
