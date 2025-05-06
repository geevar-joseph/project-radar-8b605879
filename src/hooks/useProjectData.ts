
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

      // Create a map of projects by ID for easy lookup
      const projectsById = new Map();
      projectsData.forEach(project => {
        projectsById.set(project.id, project);
      });

      // Fetch project reports
      const { reportsData, error: reportsError } = await fetchProjectReports();
      
      if (reportsError) throw reportsError;

      console.log('Project Reports Data:', reportsData);
      console.log('Reports by month:', reportsData.map(r => r.reporting_period));

      // Create a combined dataset from projects and reports
      let formattedReports: ProjectReport[] = [];

      // Process all reports first
      if (reportsData && reportsData.length > 0) {
        // Transform each report, ensuring it has the proper project relationship
        formattedReports = reportsData.map(report => {
          // Ensure each report is linked to its parent project
          const mappedReport = mapToProjectReport(report);
          return mappedReport;
        });
      }

      // Add projects that don't have reports yet with default values
      const reportedProjectIds = new Set(formattedReports.map(r => r.project_id));
      
      projectsData.forEach(project => {
        if (!reportedProjectIds.has(project.id)) {
          formattedReports.push({
            id: project.id,
            projectName: project.project_name,
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
            overallProjectScore: 'N.A.',
            submissionDate: project.updated_at,
            project_id: project.id,  // Include the project ID for relationship
            // Add missing fields
            notes: '',
            keyAchievements: '',
            primaryChallenges: '',
            nextSteps: '',
            followUpActions: ''
          });
        }
      });
      
      console.log('Combined Formatted Data:', formattedReports);
      console.log('Reports by period after mapping:', formattedReports.map(r => r.reportingPeriod));
      
      // Log reports for the March 2025 period for debugging
      const marchReports = formattedReports.filter(r => r.reportingPeriod === "2025-03");
      console.log(`Found ${marchReports.length} reports for March 2025:`, marchReports);
      
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
    
    const filtered = projects.filter(project => project.reportingPeriod === period);
    console.log(`Filtering for period ${period}: Found ${filtered.length} projects`);
    
    // Add detailed logging to understand what's in the data
    if (period === "2025-03") {
      console.log("All reporting periods in projects:", projects.map(p => p.reportingPeriod));
      console.log("Exact match check:", 
        projects.filter(p => p.reportingPeriod === "2025-03").length,
        "projects with exact '2025-03' match"
      );
      
      // Check for any close matches or formatting issues
      const possibleMatches = projects.filter(p => 
        p.reportingPeriod?.includes("2025") && 
        p.reportingPeriod?.includes("03") || 
        p.reportingPeriod?.includes("3")
      );
      console.log("Possible March 2025 matches:", possibleMatches.length);
      console.log("Sample of possible matches:", possibleMatches.slice(0, 3));
    }
    
    return filtered;
  };

  /**
   * Filter projects by reporting period synchronously
   * This is used for real-time filtering in components
   */
  const getFilteredProjectsSync = (period?: string) => {
    if (!period) return projects;
    
    // Enhanced logging for debugging the March 2025 issue
    console.log(`Filtering synchronously for period ${period}`);
    console.log(`Total projects before filtering: ${projects.length}`);
    
    const filtered = projects.filter(project => {
      const isMatch = project.reportingPeriod === period;
      if (period === "2025-03" && project.reportingPeriod?.includes("2025")) {
        console.log(`Project ${project.projectName} has period '${project.reportingPeriod}', match: ${isMatch}`);
      }
      return isMatch;
    });
    
    console.log(`Filtering sync for period ${period}: Found ${filtered.length} projects`);
    return filtered;
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
