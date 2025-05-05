
import { createContext, useContext, ReactNode } from "react";
import { ProjectReport } from "../types/project";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface ProjectContextType {
  projects: ProjectReport[];
  projectNames: string[];
  teamMembers: string[];
  addProject: (project: ProjectReport) => void;
  getProject: (id: string) => ProjectReport | undefined;
  getUniqueReportingPeriods: () => string[];
  getFilteredProjects: (period?: string) => ProjectReport[];
  selectedPeriod: string | undefined;
  setSelectedPeriod: (period: string | undefined) => void;
  addProjectName: (
    name: string, 
    clientName?: string,
    jiraId?: string,
    projectType?: string,
    projectStatus?: string,
    assignedPM?: string
  ) => Promise<{ success: boolean; error?: Error }>;
  removeProjectName: (name: string) => Promise<boolean>;
  addTeamMember: (name: string, email: string, role: string) => Promise<void>;
  removeTeamMember: (name: string) => void;
  updateProjectDetails: (originalName: string, updateData: {
    projectName: string;
    clientName?: string;
    projectType?: string;
    projectStatus?: string;
    assignedPM?: string;
  }) => Promise<boolean>;
  updateTeamMember: (originalName: string, name: string, email: string, role: string) => Promise<boolean>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { 
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
    updateProjectDetails
  } = useProjects();

  const {
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMember
  } = useTeamMembers();

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      projectNames,
      teamMembers,
      addProject, 
      getProject, 
      getUniqueReportingPeriods,
      getFilteredProjects,
      selectedPeriod,
      setSelectedPeriod,
      addProjectName,
      removeProjectName,
      addTeamMember,
      removeTeamMember,
      updateProjectDetails,
      updateTeamMember,
      isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
