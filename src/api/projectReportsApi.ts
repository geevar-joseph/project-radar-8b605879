
import { supabase } from "@/integrations/supabase/client";
import { ProjectReport } from "@/types/project";
import { mapToProjectReport } from "./mappers";

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
 * Adds a project report to Supabase
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
