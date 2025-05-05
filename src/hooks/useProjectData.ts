
import { useState, useEffect } from "react";
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
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // Fetch projects
      const { projectsData, error: projectsError } = await fetchProjects();
      
      if (projectsError) throw projectsError;

      // Extract project names
      const names = projectsData.map(project => project.project_name);
      setProjectNames(names);

      // Fetch project reports
      const { reportsData, error: reportsError } = await fetchProjectReports();
      
      if (reportsError) throw reportsError;

      console.log('Project Reports Data:', reportsData);

      // If no reports yet, use the sample data temporarily
      if (reportsData.length === 0) {
        setProjects(sampleProjects);
      } else {
        // Convert the report data to our application format
        const formattedReports = reportsData.map(report => {
          return mapToProjectReport(report);
        });
        
        console.log('Formatted Reports:', formattedReports);
        setProjects(formattedReports);
      }
    } catch (error) {
      console.error('Error loading projects data:', error);
      // Fallback to sample data
      setProjects(sampleProjects);
      setProjectNames(sampleProjects.map(p => p.projectName).filter((value, index, self) => self.indexOf(value) === index));
    } finally {
      setIsLoading(false);
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
    loadProjects,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects
  };
};
