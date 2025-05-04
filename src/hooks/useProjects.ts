import { useState, useEffect } from "react";
import { ProjectReport } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import { sampleProjects } from "@/data/mockData";
import {
  fetchProjects,
  fetchProjectReports,
  mapToProjectReport,
  addProjectReport as apiAddProjectReport,
  addProjectName as apiAddProjectName,
  removeProjectName as apiRemoveProjectName,
  updateProjectDetails as apiUpdateProjectDetails
} from "@/api/projectApi";

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [projectNames, setProjectNames] = useState<string[]>([]);
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

      // If no reports yet, use the sample data temporarily
      if (reportsData.length === 0) {
        setProjects(sampleProjects);
      } else {
        // Convert the report data to our application format
        const formattedReports = reportsData.map(report => {
          const project = report.projects;
          return mapToProjectReport({
            ...report,
            project_name: project?.project_name,
            client_name: project?.client_name,
            project_type: project?.project_type,
            project_status: project?.project_status,
            assigned_pm: project?.assigned_pm
          });
        });
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

  const addProject = async (project: ProjectReport) => {
    try {
      const { success, error } = await apiAddProjectReport(project);
      
      if (!success) throw error;
      
      setProjects([...projects, project]);
      
      toast({
        title: "Report Submitted",
        description: `Project report for ${project.projectName} has been submitted successfully.`,
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "There was an error submitting the report. Please try again.",
        variant: "destructive"
      });
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

  const addProjectName = async (name: string) => {
    if (!projectNames.includes(name)) {
      try {
        const { success, error } = await apiAddProjectName(name);
        
        if (!success) throw error;
        
        setProjectNames([...projectNames, name]);
        
        toast({
          title: "Project Added",
          description: `"${name}" has been added to the projects list.`,
        });
      } catch (error) {
        console.error('Error adding project name:', error);
        toast({
          title: "Error",
          description: "There was an error adding the project. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const removeProjectName = async (name: string) => {
    try {
      const { success, error } = await apiRemoveProjectName(name);
      
      if (!success) throw error;

      setProjectNames(projectNames.filter(project => project !== name));
      
      toast({
        title: "Project Removed",
        description: `"${name}" has been removed from the projects list.`,
      });
    } catch (error) {
      console.error('Error removing project name:', error);
      toast({
        title: "Error",
        description: "There was an error removing the project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateProjectDetails = async (originalName: string, updateData: {
    projectName: string;
    clientName?: string;
    projectType?: string;
    projectStatus?: string;
    assignedPM?: string;
  }) => {
    try {
      const { success, error } = await apiUpdateProjectDetails(originalName, updateData);
      
      if (!success) throw error;

      // Update local state - find and update the project in projects array
      setProjects(projects.map(project => {
        if (project.projectName === originalName) {
          return {
            ...project,
            projectName: updateData.projectName,
            clientName: updateData.clientName || project.clientName,
            projectType: updateData.projectType || project.projectType,
            projectStatus: updateData.projectStatus || project.projectStatus,
            assignedPM: updateData.assignedPM || project.assignedPM
          };
        }
        return project;
      }));

      // If project name changed, update projectNames array
      if (originalName !== updateData.projectName) {
        setProjectNames(projectNames.map(name => 
          name === originalName ? updateData.projectName : name
        ));
      }
      
      toast({
        title: "Project Updated",
        description: `"${updateData.projectName}" has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project details:', error);
      toast({
        title: "Error",
        description: "There was an error updating the project. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    projects,
    projectNames,
    selectedPeriod,
    setSelectedPeriod,
    isLoading,
    addProject,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects,
    addProjectName,
    removeProjectName,
    updateProjectDetails,
    loadProjects
  };
};
