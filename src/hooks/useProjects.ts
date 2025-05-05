import { useState, useEffect } from "react";
import { ProjectReport, ProjectType, ProjectStatus } from "@/types/project";
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

  const addProjectName = async (
    name: string,
    clientName?: string,
    jiraId?: string,
    projectType?: string,
    projectStatus?: string,
    assignedPM?: string
  ) => {
    if (!projectNames.includes(name)) {
      try {
        const { success, error } = await apiAddProjectName(
          name,
          clientName,
          jiraId,
          projectType,
          projectStatus,
          assignedPM
        );
        
        if (!success) throw error;
        
        setProjectNames([...projectNames, name]);
        
        toast({
          title: "Project Added",
          description: `"${name}" has been added to the projects list.`,
        });
        
        // Reload projects to get the latest data
        loadProjects();
        
        return { success: true };
      } catch (error) {
        console.error('Error adding project name:', error);
        toast({
          title: "Error",
          description: "There was an error adding the project. Please try again.",
          variant: "destructive"
        });
        return { success: false, error };
      }
    }
    return { success: false, error: new Error("Project name already exists") };
  };

  const removeProjectName = async (name: string) => {
    try {
      const { success, error } = await apiRemoveProjectName(name);
      
      if (!success) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "There was an error removing the project.",
          variant: "destructive"
        });
        return false;
      }

      setProjectNames(projectNames.filter(project => project !== name));
      
      toast({
        title: "Project Removed",
        description: `"${name}" has been removed from the projects list.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error removing project name:', error);
      toast({
        title: "Error",
        description: "There was an error removing the project. Please try again.",
        variant: "destructive"
      });
      return false;
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
      const updatedProjects = projects.map(project => {
        if (project.projectName === originalName) {
          return {
            ...project,
            projectName: updateData.projectName,
            clientName: updateData.clientName || project.clientName,
            projectType: (updateData.projectType as ProjectType) || project.projectType,
            projectStatus: (updateData.projectStatus as ProjectStatus) || project.projectStatus,
            assignedPM: updateData.assignedPM || project.assignedPM
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);

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
