
import { z } from "zod";

// Enums
export type ProjectType = "Service" | "Product" | "Maintenance" | "Training";
export type ProjectStatus = "Active" | "Completed" | "On Hold" | "Cancelled";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical" | "N.A.";
export type FinancialHealth = "Healthy" | "On Watch" | "At Risk" | "Critical" | "N.A.";
export type CompletionStatus = "Completely" | "Mostly" | "Partially" | "Not completed" | "N.A.";
export type TeamMorale = "High" | "Good" | "Moderate" | "Low" | "Burnt Out" | "N.A.";
export type CustomerSatisfaction = "Very Satisfied" | "Satisfied" | "Neutral / Unclear" | "Dissatisfied" | "Very Dissatisfied" | "N.A.";
export type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | "N.A.";

// Used for KPI charts to convert text ratings to numbers for values that don't have a specific mapping
export const ratingToValueMap: Record<string, number> = {
  "Excellent": 4,
  "Good": 3,
  "Fair": 2,
  "Poor": 1,
  "N.A.": 0,
  "Very Satisfied": 4,
  "Satisfied": 3,
  "Neutral / Unclear": 2,
  "Dissatisfied": 1,
  "Very Dissatisfied": 0.5
};

// Specific mappings for different value types
export const riskToValueMap: Record<RiskLevel, number> = {
  "Low": 4,
  "Medium": 3,
  "High": 2,
  "Critical": 1,
  "N.A.": 0
};

export const financialToValueMap: Record<FinancialHealth, number> = {
  "Healthy": 4,
  "On Watch": 3,
  "At Risk": 2,
  "Critical": 1,
  "N.A.": 0
};

export const completionToValueMap: Record<CompletionStatus, number> = {
  "Completely": 4,
  "Mostly": 3,
  "Partially": 2,
  "Not completed": 1,
  "N.A.": 0
};

export const moraleToValueMap: Record<TeamMorale, number> = {
  "High": 4,
  "Good": 3,
  "Moderate": 2,
  "Low": 1,
  "Burnt Out": 0.5,
  "N.A.": 0
};

export const satisfactionToValueMap: Record<CustomerSatisfaction, number> = {
  "Very Satisfied": 4,
  "Satisfied": 3,
  "Neutral / Unclear": 2,
  "Dissatisfied": 1,
  "Very Dissatisfied": 0.5,
  "N.A.": 0
};

// Color maps for UI
export const riskToColorMap: Record<RiskLevel, string> = {
  "Low": "bg-emerald-500",
  "Medium": "bg-blue-400",
  "High": "bg-amber-400",
  "Critical": "bg-red-500",
  "N.A.": "bg-gray-300"
};

export const healthToColorMap: Record<FinancialHealth, string> = {
  "Healthy": "bg-emerald-500",
  "On Watch": "bg-blue-400",
  "At Risk": "bg-amber-400",
  "Critical": "bg-red-500",
  "N.A.": "bg-gray-300"
};

// Interface for project reports
export interface ProjectReport {
  id: string;
  projectName: string;
  clientName?: string;
  projectType?: ProjectType;
  projectStatus?: ProjectStatus;
  assignedPM?: string;
  jiraId?: string;
  submittedBy: string;
  reportingPeriod: string;
  riskLevel: RiskLevel;
  financialHealth: FinancialHealth;
  completionOfPlannedWork: CompletionStatus;
  teamMorale: TeamMorale;
  customerSatisfaction: CustomerSatisfaction;
  projectManagerEvaluation: RatingValue;
  frontEndQuality: RatingValue;
  backEndQuality: RatingValue;
  testingQuality: RatingValue;
  designQuality: RatingValue;
  overallProjectScore: RatingValue;
  submissionDate: string;
  notes?: string;
  keyAchievements?: string;
  primaryChallenges?: string;
  nextSteps?: string;
  followUpActions?: string;
  project_id?: string; // Add project_id field to maintain relationship with projects table
}

// Zod schema for project reports
export const projectReportSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  clientName: z.string().optional(),
  projectType: z.enum(["Service", "Product", "Maintenance", "Training"]).optional(),
  projectStatus: z.enum(["Active", "Completed", "On Hold", "Cancelled"]).optional(),
  assignedPM: z.string().optional(),
  jiraId: z.string().optional(),
  submittedBy: z.string(),
  reportingPeriod: z.string(),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical", "N.A."]),
  financialHealth: z.enum(["Healthy", "On Watch", "At Risk", "Critical", "N.A."]),
  completionOfPlannedWork: z.enum(["Completely", "Mostly", "Partially", "Not completed", "N.A."]),
  teamMorale: z.enum(["High", "Good", "Moderate", "Low", "Burnt Out", "N.A."]),
  customerSatisfaction: z.enum(["Very Satisfied", "Satisfied", "Neutral / Unclear", "Dissatisfied", "Very Dissatisfied", "N.A."]),
  projectManagerEvaluation: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  frontEndQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  backEndQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  testingQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  designQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  overallProjectScore: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  submissionDate: z.string(),
  notes: z.string().optional(),
  keyAchievements: z.string().optional(),
  primaryChallenges: z.string().optional(),
  nextSteps: z.string().optional(),
  followUpActions: z.string().optional(),
  project_id: z.string().optional()
});

// Form types
export type ProjectReportFormValues = z.infer<typeof projectReportSchema>;
