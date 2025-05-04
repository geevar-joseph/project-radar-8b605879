
import { createContext, useContext, useState, ReactNode } from "react";
import { ProjectReport } from "../types/project";
import { sampleProjects } from "../data/mockData";
import { useToast } from "@/components/ui/use-toast";

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
  addProjectName: (name: string) => void;
  removeProjectName: (name: string) => void;
  addTeamMember: (name: string) => void;
  removeTeamMember: (name: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<ProjectReport[]>(sampleProjects);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [projectNames, setProjectNames] = useState<string[]>([
    "Dashboard Redesign", 
    "Mobile App Development", 
    "API Integration", 
    "Cloud Migration", 
    "E-commerce Platform"
  ]);
  const [teamMembers, setTeamMembers] = useState<string[]>([
    "John Smith", 
    "Sarah Johnson", 
    "Michael Davis", 
    "Emily Wilson", 
    "David Martinez"
  ]);
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

  const addProjectName = (name: string) => {
    if (!projectNames.includes(name)) {
      setProjectNames([...projectNames, name]);
      toast({
        title: "Project Added",
        description: `"${name}" has been added to the projects list.`,
      });
    }
  };

  const removeProjectName = (name: string) => {
    setProjectNames(projectNames.filter(project => project !== name));
    toast({
      title: "Project Removed",
      description: `"${name}" has been removed from the projects list.`,
    });
  };

  const addTeamMember = (name: string) => {
    if (!teamMembers.includes(name)) {
      setTeamMembers([...teamMembers, name]);
      toast({
        title: "Team Member Added",
        description: `"${name}" has been added to the team members list.`,
      });
    }
  };

  const removeTeamMember = (name: string) => {
    setTeamMembers(teamMembers.filter(member => member !== name));
    toast({
      title: "Team Member Removed",
      description: `"${name}" has been removed from the team members list.`,
    });
  };

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
      removeTeamMember
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
