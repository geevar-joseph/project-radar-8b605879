
import { ProjectReport, ProjectType, ProjectStatus } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
import {
  addProjectName as apiAddProjectName,
  removeProjectName as apiRemoveProjectName,
  updateProjectDetails as apiUpdateProjectDetails
} from "@/api/projectsApi";
import { addProjectReport } from "@/api/projectReportsApi";

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
      
      // Refresh projects data to ensure consistency
      await loadProjects();
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
        const result = await apiAddProjectName(
          name,
          clientName,
          jiraId,  // Pass jiraId as is - null if empty
          projectType,
          projectStatus,
          assignedPM
        );
        
        if (!result || !result.success) throw result?.error || new Error("Failed to add project");
        
        setProjectNames([...projectNames, name]);
        
        toast({
          title: "Project Added",
          description: `"${name}" has been added to the projects list.`,
        });
        
        // Always reload projects immediately after adding to ensure data consistency
        await loadProjects();
        
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
      const result = await apiRemoveProjectName(name);
      
      // Check if result exists before accessing its properties
      if (!result) {
        toast({
          title: "Error",
          description: "Unexpected error while removing the project.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!result.success) {
        const errorMessage = result.error instanceof Error ? result.error.message : "There was an error removing the project.";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        console.error("Remove project error:", errorMessage);
        return false;
      }

      setProjectNames(projectNames.filter(project => project !== name));
      
      toast({
        title: "Project Removed",
        description: `"${name}" has been removed from the projects list.`,
      });
      
      // Reload projects after removal
      await loadProjects();
      
      return true;
    } catch (error) {
      console.error('Error removing project name:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `There was an error removing the project: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProjectDetails = async (originalName: string, updateData: {
    projectName: string;
    clientName?: string;
    jiraId?: string;
    projectType?: string;
    projectStatus?: string;
    assignedPM?: string;
  }) => {
    try {
      console.log('Updating project details:', originalName, updateData);
      
      // Ensure all values are properly passed to the API
      const result = await apiUpdateProjectDetails(originalName, {
        projectName: updateData.projectName,
        clientName: updateData.clientName || "",
        jiraId: updateData.jiraId || null,
        projectType: updateData.projectType || "Service",
        projectStatus: updateData.projectStatus || "Active",
        assignedPM: updateData.assignedPM || null
      });
      
      if (!result) {
        console.error('No result returned from updateProjectDetails API call');
        toast({
          title: "Error",
          description: "Unexpected error while updating the project.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!result.success) {
        console.error('Update project error:', result.error);
        throw result.error || new Error("Failed to update project");
      }

      // Update local state - find and update the project in projects array
      const updatedProjects = projects.map(project => {
        if (project.projectName === originalName) {
          return {
            ...project,
            projectName: updateData.projectName,
            clientName: updateData.clientName || project.clientName || "",
            jiraId: updateData.jiraId || project.jiraId || "",
            // Ensure proper type casting for enum values
            projectType: (updateData.projectType as ProjectType) || project.projectType || "Service" as ProjectType,
            projectStatus: (updateData.projectStatus as ProjectStatus) || project.projectStatus || "Active" as ProjectStatus,
            assignedPM: updateData.assignedPM || project.assignedPM || ""
          } as ProjectReport; // Explicitly cast to ProjectReport
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
      
      // Reload projects to ensure data consistency
      await loadProjects();
      
      return true;
    } catch (error) {
      console.error('Error updating project details:', error);
      toast({
        title: "Error",
        description: "There was an error updating the project. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    addProject,
    addProjectName,
    removeProjectName,
    updateProjectDetails
  };
};
