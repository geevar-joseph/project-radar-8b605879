
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

// Mapping risk levels to numeric values
export const riskToValueMap: Record<RiskLevel, number | null> = {
  'Low': 4,
  'Medium': 3,
  'High': 2,
  'Critical': 1,
  'N.A.': null
};

// Mapping financial health to numeric values
export const financialToValueMap: Record<FinancialHealth, number | null> = {
  'Healthy': 4,
  'On Watch': 3,
  'At Risk': 2,
  'Critical': 1,
  'N.A.': null
};

// Mapping completion status to numeric values
export const completionToValueMap: Record<CompletionStatus, number | null> = {
  'All completed': 4,
  'Mostly': 3,
  'Partially': 2,
  'Not completed': 1,
  'N.A.': null
};

// Mapping team morale to numeric values
export const moraleToValueMap: Record<TeamMorale, number | null> = {
  'High': 4,
  'Moderate': 3,
  'Low': 2,
  'Burnt Out': 1,
  'N.A.': null
};

// Mapping customer satisfaction to numeric values
export const satisfactionToValueMap: Record<CustomerSatisfaction, number | null> = {
  'Very Satisfied': 4,
  'Satisfied': 3,
  'Neutral / Unclear': 2,
  'Dissatisfied': 1,
  'N.A.': null
};

export const riskToColorMap: Record<RiskLevel, string> = {
  'Low': 'bg-emerald-500',
  'Medium': 'bg-amber-400',
  'High': 'bg-orange-400',
  'Critical': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};

export const healthToColorMap: Record<FinancialHealth, string> = {
  'Healthy': 'bg-emerald-500',
  'On Watch': 'bg-amber-400', 
  'At Risk': 'bg-orange-400',
  'Critical': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};

export const completionToColorMap: Record<CompletionStatus, string> = {
  'All completed': 'bg-emerald-500',
  'Mostly': 'bg-blue-400',
  'Partially': 'bg-amber-400',
  'Not completed': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};

export const ratingToColorMap: Record<RatingValue, string> = {
  'Excellent': 'bg-emerald-500',
  'Good': 'bg-blue-400',
  'Fair': 'bg-amber-400',
  'Poor': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};

export const moraleToColorMap: Record<TeamMorale, string> = {
  'High': 'bg-emerald-500',
  'Moderate': 'bg-blue-400',
  'Low': 'bg-orange-400', // Changed from amber to orange
  'Burnt Out': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};

export const satisfactionToColorMap: Record<CustomerSatisfaction, string> = {
  'Very Satisfied': 'bg-emerald-500',
  'Satisfied': 'bg-blue-400',
  'Neutral / Unclear': 'bg-amber-400',
  'Dissatisfied': 'bg-red-500',
  'N.A.': 'bg-gray-300'
};
