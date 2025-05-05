
import { supabase } from "@/integrations/supabase/client";
import { ProjectReport } from "@/types/project";
import { v4 as uuidv4 } from "uuid";

/**
 * Maps data from Supabase format to our application format
 */
export const mapToProjectReport = (dbReport: any): ProjectReport => {
  // Get PM name from team_members object if it exists
  let pmName = "";
  
  if (dbReport.projects?.team_members) {
    pmName = dbReport.projects.team_members.name;
  } else if (dbReport.team_members) {
    pmName = dbReport.team_members.name;
  }

  return {
    id: dbReport.id,
    projectName: dbReport.project_name || dbReport.projects?.project_name || "",
    submittedBy: dbReport.submitted_by || "",
    reportingPeriod: dbReport.reporting_period || "",
    riskLevel: dbReport.risk_level || "N.A.",
    financialHealth: dbReport.financial_health || "N.A.",
    completionOfPlannedWork: dbReport.completion_of_planned_work || "N.A.",
    teamMorale: dbReport.team_morale || "N.A.",
    customerSatisfaction: dbReport.customer_satisfaction || "N.A.",
    projectManagerEvaluation: dbReport.project_manager_evaluation || "N.A.",
    frontEndQuality: dbReport.front_end_quality || "N.A.",
    backEndQuality: dbReport.back_end_quality || "N.A.",
    testingQuality: dbReport.testing_quality || "N.A.",
    designQuality: dbReport.design_quality || "N.A.",
    submissionDate: dbReport.submission_date || new Date().toISOString(),
    clientName: dbReport.client_name || dbReport.projects?.client_name || "",
    projectType: dbReport.project_type || dbReport.projects?.project_type || undefined,
    projectStatus: dbReport.project_status || dbReport.projects?.project_status || undefined,
    assignedPM: pmName || "",
    jiraId: dbReport.jira_id || dbReport.projects?.jira_id || "",
    // Properly map the overall score
    overallProjectScore: dbReport.overall_project_score || "N.A.",
    // Add the new fields
    notes: dbReport.notes || "",
    keyAchievements: dbReport.key_achievements || "",
    primaryChallenges: dbReport.primary_challenges || "",
    nextSteps: dbReport.next_steps || "",
    followUpActions: dbReport.follow_up_actions || ""
  };
};

/**
 * Fetches all projects from Supabase
 */
export const fetchProjects = async () => {
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        team_members (
          id,
          name
        )
      `);

    if (projectsError) {
      throw projectsError;
    }
    
    return { projectsData, error: null };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projectsData: [], error };
  }
};

/**
 * Fetches all project reports from Supabase
 */
export const fetchProjectReports = async () => {
  try {
    const { data: reportsData, error: reportsError } = await supabase
      .from('project_reports')
      .select(`
        *, 
        projects (
          *,
          team_members (
            id,
            name
          )
        )
      `);

    if (reportsError) {
      throw reportsError;
    }
    
    return { reportsData, error: null };
  } catch (error) {
    console.error('Error fetching project reports:', error);
    return { reportsData: [], error };
  }
};

/**
 * Adds a project and report to Supabase
 */
export const addProjectReport = async (project: ProjectReport) => {
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
        risk_level: project.riskLevel,
        financial_health: project.financialHealth,
        completion_of_planned_work: project.completionOfPlannedWork,
        team_morale: project.teamMorale,
        customer_satisfaction: project.customerSatisfaction,
        project_manager_evaluation: project.projectManagerEvaluation,
        front_end_quality: project.frontEndQuality,
        back_end_quality: project.backEndQuality,
        testing_quality: project.testingQuality,
        design_quality: project.designQuality,
        submission_date: new Date().toISOString(),
        // We no longer use overall_project_score
        overall_project_score: "N.A.", // Keep for backward compatibility with database schema
        // Add the new fields
        notes: project.notes,
        key_achievements: project.keyAchievements,
        primary_challenges: project.primaryChallenges,
        next_steps: project.nextSteps,
        follow_up_actions: project.followUpActions
      });

    if (reportError) throw reportError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error };
  }
};

/**
 * Fetches team members from Supabase
 */
export const fetchTeamMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');

    if (error) {
      throw error;
    }

    return { members: data, error: null };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return { 
      members: [
        { 
          id: "sample-id-1", 
          name: "John Smith", 
          email: "john@example.com", 
          role: "Project Manager" 
        }
      ],
      error
    };
  }
};

/**
 * Adds a team member to Supabase
 */
export const addTeamMember = async (name: string, email: string, role: string) => {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert({
        name,
        email,
        role
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding team member:', error);
    return { success: false, error };
  }
};

/**
 * Removes a team member from Supabase
 */
export const removeTeamMember = async (name: string) => {
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

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error };
  }
};

/**
 * Adds a project name to Supabase
 */
export const addProjectName = async (name: string, clientName?: string, jiraId?: string | null, projectType?: string, projectStatus?: string, assignedPM?: string | null) => {
  try {
    const { error } = await supabase
      .from('projects')
      .insert({
        project_name: name,
        client_name: clientName || null,
        jira_id: jiraId || null,  // Ensuring we use correct column name: jira_id not jiraId
        project_type: projectType || 'Service',
        project_status: projectStatus || 'Active',
        assigned_pm: assignedPM || null
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding project name:', error);
    return { success: false, error };
  }
};

/**
 * Removes a project name from Supabase
 */
export const removeProjectName = async (name: string) => {
  try {
    // First check if there are any project reports
    const { data: reportData, error: reportError } = await supabase
      .from('project_reports')
      .select('project_id')
      .eq('projects.project_name', name)
      .limit(1);
    
    if (reportError) throw reportError;
    
    // If there are project reports linked to this project, we can't delete it
    if (reportData && reportData.length > 0) {
      return { 
        success: false, 
        error: new Error('Cannot delete project with linked reports. Delete the reports first.') 
      };
    }
    
    // Find the project by name
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

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing project name:', error);
    return { success: false, error };
  }
};

/**
 * Updates project details in Supabase
 */
export const updateProjectDetails = async (originalName: string, updateData: {
  projectName: string;
  clientName?: string;
  projectType?: string;
  projectStatus?: string;
  assignedPM?: string;
}) => {
  try {
    // Find the project by name
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('project_name', originalName)
      .single();
    
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Update the project
    const { error } = await supabase
      .from('projects')
      .update({
        project_name: updateData.projectName,
        client_name: updateData.clientName,
        project_type: updateData.projectType,
        project_status: updateData.projectStatus,
        assigned_pm: updateData.assignedPM,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProject.id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating project details:', error);
    return { success: false, error };
  }
};

/**
 * Updates team member details in Supabase
 */
export const updateTeamMember = async (originalName: string, name: string, email: string, role: string) => {
  try {
    // Find the team member by name
    const { data } = await supabase
      .from('team_members')
      .select('id')
      .eq('name', originalName)
      .single();
    
    if (!data) {
      throw new Error('Team member not found');
    }

    // Update the team member
    const { error } = await supabase
      .from('team_members')
      .update({
        name,
        email,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating team member:', error);
    return { success: false, error };
  }
};
