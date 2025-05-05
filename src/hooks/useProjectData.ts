
import { useState, useEffect, useRef } from "react";
import { ProjectReport } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import { sampleProjects } from "@/data/mockData";
import { fetchProjects, fetchProjectReports, mapToProjectReport } from "@/api/projectApi";

/**
 * Hook for fetching and managing project data
 */
export const useProjectData = () => {
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const toastShownRef = useRef<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

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

      // Extract project names
      const names = projectsData.map(project => project.project_name);
      setProjectNames(names);

      // Fetch project reports
      const { reportsData, error: reportsError } = await fetchProjectReports();
      
      if (reportsError) throw reportsError;

      console.log('Project Reports Data:', reportsData);

      // Create a combined dataset from projects and reports
      let formattedReports: ProjectReport[] = [];

      // Include all projects that have reports
      if (reportsData && reportsData.length > 0) {
        formattedReports = reportsData.map(report => mapToProjectReport(report));
      }

      // Add projects that don't have reports yet with default values
      projectsData.forEach(project => {
        const hasReport = formattedReports.some(report => 
          report.projectName === project.project_name
        );

        if (!hasReport) {
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
            submissionDate: project.updated_at
          });
        }
      });
      
      console.log('Combined Formatted Data:', formattedReports);
      setProjects(formattedReports);
      setIsError(false);
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

  const getUniqueReportingPeriods = () => {
    const periods = [...new Set(projects.map(p => p.reportingPeriod))];
    return periods.sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  const getFilteredProjects = (period?: string) => {
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
    isLoading,
    isError,
    loadProjects,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects
  };
};
