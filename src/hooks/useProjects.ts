
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
    availablePeriods,
    isLoading,
    isError,
    loadProjects,
    loadAllPeriods,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects,
    getFilteredProjectsSync
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
    availablePeriods,
    isLoading,
    isError,
    
    // Project operations
    addProject,
    getProject,
    getUniqueReportingPeriods,
    getFilteredProjects,
    getFilteredProjectsSync,
    addProjectName,
    removeProjectName,
    updateProjectDetails,
    loadProjects,
    loadAllPeriods
  };
};
