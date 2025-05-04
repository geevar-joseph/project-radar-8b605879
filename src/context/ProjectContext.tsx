
import { createContext, useContext, useState, ReactNode } from "react";
import { ProjectReport } from "../types/project";
import { sampleProjects } from "../data/mockData";
import { useToast } from "@/components/ui/use-toast";

interface ProjectContextType {
  projects: ProjectReport[];
  addProject: (project: ProjectReport) => void;
  getProject: (id: string) => ProjectReport | undefined;
  getUniqueReportingPeriods: () => string[];
  getFilteredProjects: (period?: string) => ProjectReport[];
  selectedPeriod: string | undefined;
  setSelectedPeriod: (period: string | undefined) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<ProjectReport[]>(sampleProjects);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const addProject = (project: ProjectReport) => {
    setProjects([...projects, project]);
    toast({
      title: "Report Submitted",
      description: `Project report for ${project.projectName} has been submitted successfully.`,
    });
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

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      addProject, 
      getProject, 
      getUniqueReportingPeriods,
      getFilteredProjects,
      selectedPeriod,
      setSelectedPeriod
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
