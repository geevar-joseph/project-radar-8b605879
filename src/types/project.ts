
export type RatingValue = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'N.A.';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'N.A.';
export type FinancialHealth = 'Healthy' | 'On Watch' | 'At Risk' | 'Critical' | 'N.A.';
export type CompletionStatus = 'All completed' | 'Mostly' | 'Partially' | 'Not completed' | 'N.A.';
export type TeamMorale = 'High' | 'Moderate' | 'Low' | 'Burnt Out' | 'N.A.';
export type CustomerSatisfaction = 'Very Satisfied' | 'Satisfied' | 'Neutral / Unclear' | 'Dissatisfied' | 'N.A.';
export type ProjectType = 'Development' | 'Design' | 'Research' | 'Maintenance' | 'Consulting';
export type ProjectStatus = 'Ongoing' | 'On Hold' | 'Completed' | 'Not Started';

export interface ProjectReport {
  id: string;
  projectName: string;
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
  submissionDate: string;
  clientName?: string;
  projectType?: ProjectType;
  projectStatus?: ProjectStatus;
  assignedPM?: string;
  // New fields
  notes?: string;
  keyAchievements?: string;
  primaryChallenges?: string;
  nextSteps?: string;
  followUpActions?: string;
}

// Mapping ratings to numeric values for calculations
export const ratingToValueMap: Record<RatingValue, number | null> = {
  'Excellent': 4,
  'Good': 3,
  'Fair': 2,
  'Poor': 1,
  'N.A.': null
};

export const riskToColorMap: Record<RiskLevel, string> = {
  'Low': 'bg-status-excellent',
  'Medium': 'bg-status-fair',
  'High': 'bg-status-orange',
  'Critical': 'bg-status-poor',
  'N.A.': 'bg-gray-300'
};

export const healthToColorMap: Record<FinancialHealth, string> = {
  'Healthy': 'bg-status-excellent',
  'On Watch': 'bg-status-fair', 
  'At Risk': 'bg-status-orange',
  'Critical': 'bg-status-poor',
  'N.A.': 'bg-status-na'
};

export const completionToColorMap: Record<CompletionStatus, string> = {
  'All completed': 'bg-status-excellent',
  'Mostly': 'bg-status-good',
  'Partially': 'bg-status-fair',
  'Not completed': 'bg-status-poor',
  'N.A.': 'bg-status-na'
};

export const ratingToColorMap: Record<RatingValue, string> = {
  'Excellent': 'bg-status-excellent',
  'Good': 'bg-status-good',
  'Fair': 'bg-status-fair',
  'Poor': 'bg-status-poor',
  'N.A.': 'bg-status-na'
};

export const moraleToColorMap: Record<TeamMorale, string> = {
  'High': 'bg-status-excellent',
  'Moderate': 'bg-status-good',
  'Low': 'bg-status-fair',
  'Burnt Out': 'bg-status-poor',
  'N.A.': 'bg-status-na'
};

export const satisfactionToColorMap: Record<CustomerSatisfaction, string> = {
  'Very Satisfied': 'bg-status-excellent',
  'Satisfied': 'bg-status-good',
  'Neutral / Unclear': 'bg-status-fair',
  'Dissatisfied': 'bg-status-poor',
  'N.A.': 'bg-status-na'
};
