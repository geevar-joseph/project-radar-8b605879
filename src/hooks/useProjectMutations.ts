
import { ProjectReport } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import {
  addProjectReport,
  addProjectName,
  removeProjectName,
  updateProjectDetails
} from "@/api/projectApi";

/**
 * Hook for project mutation operations (add, update, delete)
 */
export const useProjectMutations = (
  projects: ProjectReport[],
  setProjects: (projects: ProjectReport[]) => void,
  projectNames: string[],
  setProjectNames: (names: string[]) => void,
  loadProjects: () => Promise<void>
) => {
  const { toast } = useToast();

  const addProject = async (project: ProjectReport) => {
    try {
      const { success, error } = await addProjectReport(project);
      
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

  const addProjectName = async (
    name: string,
    clientName?: string,
    jiraId?: string | null,
    projectType?: string,
    projectStatus?: string,
    assignedPM?: string | null
  ) => {
    if (!projectNames.includes(name)) {
      try {
        // Pass jiraId correctly to API
        const result = await addProjectName(
          name,
          clientName,
          jiraId,  // Pass jiraId as is - null if empty
          projectType,
          projectStatus,
          assignedPM
        );
        
        if (!result.success) throw result.error;
        
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
      const result = await removeProjectName(name);
      
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error instanceof Error ? result.error.message : "There was an error removing the project.",
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
      }
      return false;
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
      const result = await updateProjectDetails(originalName, updateData);
      
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) throw result.error;
  
        // Update local state - find and update the project in projects array
        const updatedProjects = projects.map(project => {
          if (project.projectName === originalName) {
            return {
              ...project,
              projectName: updateData.projectName,
              clientName: updateData.clientName || project.clientName,
              projectType: (updateData.projectType as any) || project.projectType,
              projectStatus: (updateData.projectStatus as any) || project.projectStatus,
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
      }
      return false;
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
    addProject,
    addProjectName,
    removeProjectName,
    updateProjectDetails
  };
};
