
import { ProjectReport, RatingValue } from "@/types/project";

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

  // Default to "N.A." if overall_project_score is not provided
  const overallScore = dbReport.overall_project_score || "N.A.";
  // Make sure the overall score is a valid RatingValue
  const validOverallScore = ["Excellent", "Good", "Fair", "Poor", "N.A."].includes(overallScore) 
    ? overallScore as RatingValue 
    : "N.A." as RatingValue;

  // Ensure reporting_period is preserved exactly as it is in the database
  const reportingPeriod = dbReport.reporting_period || "";
  console.log(`Mapping report with period: ${reportingPeriod}`);

  return {
    id: dbReport.id,
    projectName: dbReport.project_name || dbReport.projects?.project_name || "",
    submittedBy: dbReport.submitted_by || "",
    reportingPeriod: reportingPeriod, // Use the exact reporting period value
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
    // Properly map the overall score as a RatingValue
    overallProjectScore: validOverallScore,
    // Add the new fields
    notes: dbReport.notes || "",
    keyAchievements: dbReport.key_achievements || "",
    primaryChallenges: dbReport.primary_challenges || "",
    nextSteps: dbReport.next_steps || "",
    followUpActions: dbReport.follow_up_actions || "",
    // Important: Add the project_id field to maintain relationship
    project_id: dbReport.project_id || undefined
  };
};
