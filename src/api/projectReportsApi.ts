
import { supabase } from "@/integrations/supabase/client";
import { ProjectReport } from "@/types/project";
import { mapToProjectReport } from "./mappers";

/**
 * Fetches all project reports from Supabase
 * Returns all reports, not just the latest for each project
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
      `)
      .order('submission_date', { ascending: false });

    if (reportsError) {
      throw reportsError;
    }
    
    console.log('All reports from API:', reportsData.length);
    return { reportsData, error: null };
  } catch (error) {
    console.error('Error fetching project reports:', error);
    return { reportsData: [], error };
  }
};

/**
 * Fetches reports for a specific project from Supabase
 */
export const fetchProjectReportsByProject = async (projectId: string) => {
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
      `)
      .eq('project_id', projectId)
      .order('reporting_period', { ascending: true });

    if (reportsError) {
      throw reportsError;
    }
    
    console.log(`Reports for project ${projectId} from API:`, reportsData.length);
    return { reportsData, error: null };
  } catch (error) {
    console.error(`Error fetching reports for project ${projectId}:`, error);
    return { reportsData: [], error };
  }
};

/**
 * Fetches reports for a specific period from Supabase
 */
export const fetchProjectReportsByPeriod = async (period: string) => {
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
      `)
      .eq('reporting_period', period);

    if (reportsError) {
      throw reportsError;
    }
    
    console.log(`Reports for period ${period} from API:`, reportsData.length);
    
    // Map the database results to ProjectReport objects
    const projectReports: ProjectReport[] = reportsData.map(report => mapToProjectReport(report));
    
    return { projectReports, error: null };
  } catch (error) {
    console.error(`Error fetching reports for period ${period}:`, error);
    return { projectReports: [], error };
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

/**
 * Fetches all unique reporting periods from Supabase without deduplication
 * This ensures we get every month that has at least one report
 */
export const fetchAllReportingPeriods = async () => {
  try {
    const { data, error } = await supabase
      .from('project_reports')
      .select('reporting_period')
      .order('reporting_period', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Extract all periods and filter out N/A or empty values
    const allPeriods = data
      .map(report => report.reporting_period)
      .filter(period => period && period !== 'N/A');
    
    // Filter out duplicates by creating a Set and convert back to array
    const uniquePeriods = [...new Set(allPeriods)];
    
    // Sort the periods in descending order (newest first)
    return uniquePeriods.sort((a, b) => {
      // If either is not in YYYY-MM format, compare strings directly
      if (!/^\d{4}-\d{2}$/.test(a) || !/^\d{4}-\d{2}$/.test(b)) {
        return b.localeCompare(a);
      }

      // Parse years and months for proper date comparison
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      
      // First compare years (in descending order)
      if (yearA !== yearB) {
        return yearB - yearA;
      } 
      // If years are the same, compare months (in descending order)
      return monthB - monthA;
    });
    
  } catch (error) {
    console.error('Error fetching all reporting periods:', error);
    return [];
  }
};
