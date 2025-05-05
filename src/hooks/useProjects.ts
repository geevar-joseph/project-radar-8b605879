
import { useProjectData } from "./useProjectData";
import { useProjectMutations } from "./useProjectMutations";
import { ProjectReport, ProjectStatus, ProjectType } from "@/types/project";

/**
 * Main hook that combines project data and mutation operations
 */
export const useProjects = () => {
  const {
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
  } = useProjectData();

  const {
    addProject,
    addProjectName,
    removeProjectName,
    updateProjectDetails
  } = useProjectMutations(
    projects,
    setProjects,
    projectNames,
    setProjectNames,
    loadProjects
  );

  return {
    // Data
    projects,
    projectNames,
    selectedPeriod,
    setSelectedPeriod,
    isLoading,
    isError,
    
    // Project operations
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
