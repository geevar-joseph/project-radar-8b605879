
import { supabase } from "@/integrations/supabase/client";
import { ProjectReport } from "@/types/project";
import { mapToProjectReport } from "./mappers";

/**
 * Fetches all project reports from Supabase
 * Returns the latest report for each project
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
    
    console.log('Raw project reports from API:', reportsData);
    
    // Log any March 2025 reports in the raw data
    const marchReports = reportsData?.filter(r => r.reporting_period === "2025-03");
    if (marchReports && marchReports.length > 0) {
      console.log(`Found ${marchReports.length} March 2025 reports in the raw data:`, 
        marchReports.map(r => ({
          id: r.id, 
          project_id: r.project_id,
          reporting_period: r.reporting_period,
          project_name: r.projects?.project_name
        }))
      );
    } else {
      console.log('No March 2025 reports found in raw data');
    }
    
    // Create a map to store the latest report for each project
    const latestReportsByProject = new Map<string, any>();
      
    // Process reports to find the latest for each project
    if (reportsData && reportsData.length > 0) {
      reportsData.forEach(report => {
        const projectId = report.project_id;
        if (!projectId) return;
        
        // If we don't have this project yet, or this report is newer
        const existingReport = latestReportsByProject.get(projectId);
        if (!existingReport || 
            (new Date(report.submission_date) > new Date(existingReport.submission_date))) {
          latestReportsByProject.set(projectId, report);
        }
      });
    }
    
    // Convert map back to array of latest reports only
    const dedupedReports = Array.from(latestReportsByProject.values());
    console.log('Deduplicated reports from API:', dedupedReports.length);
    
    // Double-check March 2025 reports after deduplication
    const dedupedMarchReports = dedupedReports.filter(r => r.reporting_period === "2025-03");
    console.log(`Found ${dedupedMarchReports.length} March 2025 reports after deduplication`);
    
    return { reportsData: dedupedReports, error: null };
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
