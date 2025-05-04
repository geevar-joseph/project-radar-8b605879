
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ProjectReport } from "../types/project";
import { sampleProjects } from "../data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  addTeamMember: (name: string, email: string, role: string) => Promise<void>;
  removeTeamMember: (name: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch data from Supabase on component mount
  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) {
        throw projectsError;
      }

      // Extract project names
      const names = projectsData.map(project => project.project_name);
      setProjectNames(names);

      // Fetch project reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('project_reports')
        .select('*');

      if (reportsError) {
        throw reportsError;
      }

      // If no reports yet, use the sample data temporarily
      if (reportsData.length === 0) {
        setProjects(sampleProjects);
      } else {
        setProjects(reportsData);
      }
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to sample data
      setProjects(sampleProjects);
      setProjectNames(sampleProjects.map(p => p.projectName).filter((value, index, self) => self.indexOf(value) === index));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('name');

      if (error) {
        throw error;
      }

      const names = data.map(member => member.name);
      setTeamMembers(names);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Fallback to sample data
      setTeamMembers([
        "John Smith", 
        "Sarah Johnson", 
        "Michael Davis", 
        "Emily Wilson", 
        "David Martinez"
      ]);
    }
  };

  const addProject = async (project: ProjectReport) => {
    try {
      // Check if project exists in database
      let projectId = '';
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('project_name', project.projectName)
        .single();
      
      if (!existingProject) {
        // Create new project if it doesn't exist
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            project_name: project.projectName,
            client_name: project.clientName,
            project_type: project.projectType,
            project_status: project.projectStatus
          })
          .select('id')
          .single();
          
        if (projectError) throw projectError;
        projectId = newProject.id;
      } else {
        projectId = existingProject.id;
      }

      // Add the project report
      const { error: reportError } = await supabase
        .from('project_reports')
        .insert({
          project_id: projectId,
          submitted_by: project.submittedBy,
          reporting_period: project.reportingPeriod,
          overall_project_score: project.overallProjectScore,
          risk_level: project.riskLevel,
          financial_health: project.financialHealth,
          completion_of_planned_work: project.completionOfPlannedWork,
          team_morale: project.teamMorale,
          project_manager_evaluation: project.projectManagerEvaluation,
          front_end_quality: project.frontEndQuality,
          back_end_quality: project.backEndQuality,
          testing_quality: project.testingQuality,
          design_quality: project.designQuality,
          submission_date: new Date().toISOString()
        });

      if (reportError) throw reportError;
      
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
        const { error } = await supabase
          .from('projects')
          .insert({
            project_name: name
          });

        if (error) throw error;
        
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
      const { data } = await supabase
        .from('projects')
        .select('id')
        .eq('project_name', name)
        .single();
      
      if (data) {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', data.id);

        if (error) throw error;
      }

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

  const addTeamMember = async (name: string, email: string, role: string) => {
    if (!teamMembers.includes(name)) {
      try {
        const { error } = await supabase
          .from('team_members')
          .insert({
            name,
            email,
            role
          });

        if (error) throw error;
        
        setTeamMembers([...teamMembers, name]);
        
        toast({
          title: "Team Member Added",
          description: `"${name}" has been added to the team members list.`,
        });
      } catch (error) {
        console.error('Error adding team member:', error);
        toast({
          title: "Error",
          description: "There was an error adding the team member. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
  };

  const removeTeamMember = async (name: string) => {
    try {
      const { data } = await supabase
        .from('team_members')
        .select('id')
        .eq('name', name)
        .single();
      
      if (data) {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', data.id);

        if (error) throw error;
      }

      setTeamMembers(teamMembers.filter(member => member !== name));
      
      toast({
        title: "Team Member Removed",
        description: `"${name}" has been removed from the team members list.`,
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "There was an error removing the team member. Please try again.",
        variant: "destructive"
      });
    }
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
      removeTeamMember,
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
