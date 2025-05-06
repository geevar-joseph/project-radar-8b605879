import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ProjectReport, ratingToValueMap, RatingValue } from '@/types/project';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useProjectContext } from '@/context/ProjectContext';
import { Star, Smile, Users, Building } from 'lucide-react';
import { formatPeriodForChart } from '@/utils/formatPeriods';

interface ProjectKPITrendChartProps {
  projectName: string;
  projectReports?: ProjectReport[]; // New prop to receive project-specific reports
}

// Helper function to convert rating to numeric value
const ratingToNumeric = (rating: RatingValue) => {
  return ratingToValueMap[rating] || 0;
};

// Function to convert various status values to numeric
const statusToNumeric = (status: string, type: string) => {
  if (type === 'risk') {
    switch (status) {
      case 'Low': return 4;
      case 'Medium': return 2;
      case 'High': return 1;
      default: return 0;
    }
  } else if (type === 'financial') {
    switch (status) {
      case 'Healthy': return 4;
      case 'On Watch': return 2;
      case 'At Risk': return 1;
      default: return 0;
    }
  } else if (type === 'completion') {
    switch (status) {
      case 'All completed': return 4;
      case 'Mostly': return 3;
      case 'Partially': return 2;
      case 'Not completed': return 1;
      default: return 0;
    }
  } else if (type === 'morale') {
    switch (status) {
      case 'High': return 4;
      case 'Moderate': return 3;
      case 'Low': return 1;
      default: return 0;
    }
  } else if (type === 'satisfaction') {
    switch (status) {
      case 'Very Satisfied': return 4;
      case 'Satisfied': return 3;
      case 'Neutral / Unclear': return 2;
      case 'Dissatisfied': return 1;
      default: return 0;
    }
  }
  return 0;
};

// Calculate overall score from a report - Updated to match MonthlyReportsTable approach
const calculateOverallScore = (report: ProjectReport): number => {
  // If the report already has an overall score that's not "N.A." or "N/A", convert it to numeric
  if (report.overallProjectScore && 
      !["N.A.", "N/A", "", "0.0", "0"].includes(report.overallProjectScore)) {
    // If it's a numeric string like "3.5", parse it
    const numericScore = parseFloat(report.overallProjectScore);
    if (!isNaN(numericScore) && numericScore > 0 && numericScore <= 4) {
      return numericScore;
    }
    
    // If it's a rating string like "Good", map it to a numeric value
    if (ratingToValueMap[report.overallProjectScore]) {
      return ratingToValueMap[report.overallProjectScore] || 0;
    }
  }
  
  // Otherwise calculate from individual scores using a more comprehensive mapping
  const scoreMap: Record<string, number> = {
    // Standard rating values
    "Excellent": 4,
    "Good": 3,
    "Fair": 2,
    "Poor": 1,
    // Risk levels
    "Low": 4,
    "Medium": 3,
    "High": 2,
    "Critical": 1,
    // Financial health
    "Healthy": 4,
    "On Watch": 3,
    "At Risk": 2,
    "Critical": 1,
    // Completion status
    "Completely": 4,
    "All completed": 4,
    "Mostly": 3,
    "Partially": 2,
    "Not completed": 1,
    // Satisfaction levels
    "Very Satisfied": 4,
    "Satisfied": 3,
    "Neutral / Unclear": 2.5,
    "Somewhat Dissatisfied": 2,
    "Dissatisfied": 1,
    "Very Dissatisfied": 0.5,
    // Team morale
    "High": 4,
    "Good": 3.5,
    "Moderate": 3,
    "Low": 2,
    "Burnt Out": 1,
    // N/A values
    "N.A.": 0,
    "N/A": 0,
    "": 0
  };
  
  // Collect all relevant scores from the report
  const scores = [
    report.riskLevel && scoreMap[report.riskLevel] !== undefined ? scoreMap[report.riskLevel] : null,
    report.financialHealth && scoreMap[report.financialHealth] !== undefined ? scoreMap[report.financialHealth] : null,
    report.customerSatisfaction && scoreMap[report.customerSatisfaction] !== undefined ? scoreMap[report.customerSatisfaction] : null,
    report.teamMorale && scoreMap[report.teamMorale] !== undefined ? scoreMap[report.teamMorale] : null,
    report.completionOfPlannedWork && scoreMap[report.completionOfPlannedWork] !== undefined ? scoreMap[report.completionOfPlannedWork] : null,
    report.projectManagerEvaluation && scoreMap[report.projectManagerEvaluation] !== undefined ? scoreMap[report.projectManagerEvaluation] : null,
    report.frontEndQuality && scoreMap[report.frontEndQuality] !== undefined ? scoreMap[report.frontEndQuality] : null,
    report.backEndQuality && scoreMap[report.backEndQuality] !== undefined ? scoreMap[report.backEndQuality] : null,
    report.testingQuality && scoreMap[report.testingQuality] !== undefined ? scoreMap[report.testingQuality] : null,
    report.designQuality && scoreMap[report.designQuality] !== undefined ? scoreMap[report.designQuality] : null
  ];
  
  // Filter out null values
  const validScores = scores.filter(score => score !== null) as number[];
  
  if (validScores.length === 0) return 0;
  
  // Calculate the average score
  return parseFloat((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2));
};

// Calculate team KPIs score (aggregate of team-related metrics)
const calculateTeamKPIsScore = (report: ProjectReport): number => {
  const teamMetrics = [
    statusToNumeric(report.teamMorale, 'morale'),
    ratingToNumeric(report.projectManagerEvaluation)
  ];
  
  const validMetrics = teamMetrics.filter(metric => metric > 0);
  
  if (validMetrics.length === 0) return 0;
  
  return parseFloat((validMetrics.reduce((a, b) => a + b, 0) / validMetrics.length).toFixed(2));
};

// Calculate departmental score (aggregate of technical department metrics)
const calculateDepartmentalScore = (report: ProjectReport): number => {
  const deptMetrics = [
    ratingToNumeric(report.frontEndQuality),
    ratingToNumeric(report.backEndQuality),
    ratingToNumeric(report.testingQuality),
    ratingToNumeric(report.designQuality)
  ];
  
  const validMetrics = deptMetrics.filter(metric => metric > 0);
  
  if (validMetrics.length === 0) return 0;
  
  return parseFloat((validMetrics.reduce((a, b) => a + b, 0) / validMetrics.length).toFixed(2));
};

// New function to calculate KPI changes between two reports
interface KPIChange {
  name: string;
  previous: number;
  current: number;
  change: number;
  status: 'improved' | 'declined' | 'no-change';
  category: string; // Added category for coloring
}

const calculateKPIChanges = (currentReport: ProjectReport, previousReport: ProjectReport | undefined): KPIChange[] => {
  if (!previousReport) return [];
  
  const metrics = [
    {
      name: "Overall Score",
      current: calculateOverallScore(currentReport),
      previous: calculateOverallScore(previousReport),
      category: "overall"
    },
    {
      name: "Risk Level",
      current: statusToNumeric(currentReport.riskLevel, 'risk'),
      previous: statusToNumeric(previousReport.riskLevel, 'risk'),
      category: "risk",
      // Special case for risk: lower values are worse, higher values are better
      invertedTrend: true
    },
    {
      name: "Financial Health",
      current: statusToNumeric(currentReport.financialHealth, 'financial'),
      previous: statusToNumeric(previousReport.financialHealth, 'financial'),
      category: "financial"
    },
    {
      name: "Customer Satisfaction",
      current: statusToNumeric(currentReport.customerSatisfaction, 'satisfaction'),
      previous: statusToNumeric(previousReport.customerSatisfaction, 'satisfaction'),
      category: "customerSatisfaction"
    },
    {
      name: "Team KPIs",
      current: calculateTeamKPIsScore(currentReport),
      previous: calculateTeamKPIsScore(previousReport),
      category: "teamKPIs"
    },
    {
      name: "Departmental Score",
      current: calculateDepartmentalScore(currentReport),
      previous: calculateDepartmentalScore(previousReport),
      category: "departmentalScore"
    }
  ];
  
  return metrics
    .filter(metric => metric.current > 0 && metric.previous > 0) // Filter out metrics with no data
    .map(metric => {
      const change = parseFloat((metric.current - metric.previous).toFixed(1));
      let status: 'improved' | 'declined' | 'no-change' = 'no-change';
      
      // Apply standard logic for most KPIs, but invert for Risk Level
      const invertedTrend = metric.invertedTrend === true;
      
      if (change > 0) {
        status = invertedTrend ? 'improved' : 'improved';
      } else if (change < 0) {
        status = invertedTrend ? 'declined' : 'declined';
      }
      
      return {
        name: metric.name,
        current: metric.current,
        previous: metric.previous,
        change,
        status,
        category: metric.category
      };
    });
};

export const ProjectKPITrendChart: React.FC<ProjectKPITrendChartProps> = ({ 
  projectName,
  projectReports = [] // Default to empty array if not provided
}) => {
  const { projects } = useProjectContext();
  
  // Prioritize passed project reports, fall back to context filtering if needed
  const projectSpecificReports = projectReports.length > 0 
    ? projectReports 
    : projects.filter(p => p.projectName === projectName);
  
  // Filter reports for this project and sort by reporting period
  const projectReportsSorted = projectSpecificReports
    .sort((a, b) => a.reportingPeriod.localeCompare(b.reportingPeriod));
  
  if (projectReportsSorted.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center"> {/* Increased height from 300px to 400px */}
        <p className="text-muted-foreground">Not enough data for trend analysis</p>
      </div>
    );
  }

  // Get latest two reports for KPI change calculation
  const latestReport = projectReportsSorted[projectReportsSorted.length - 1];
  const previousReport = projectReportsSorted[projectReportsSorted.length - 2];
  
  // Calculate KPI changes
  const kpiChanges = calculateKPIChanges(latestReport, previousReport);
  
  // Group KPI changes by status and sort by magnitude of change
  const improvedKPIs = kpiChanges
    .filter(kpi => kpi.status === 'improved')
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  const declinedKPIs = kpiChanges
    .filter(kpi => kpi.status === 'declined')
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  const unchangedKPIs = kpiChanges
    .filter(kpi => kpi.status === 'no-change');

  // Use the utility function instead of inline formatting
  const formatPeriod = formatPeriodForChart;

  // Prepare data for the line chart
  const trendData = projectReportsSorted.map(report => ({
    period: formatPeriod(report.reportingPeriod),
    risk: statusToNumeric(report.riskLevel, 'risk'),
    financial: statusToNumeric(report.financialHealth, 'financial'),
    completion: statusToNumeric(report.completionOfPlannedWork, 'completion'),
    morale: statusToNumeric(report.teamMorale, 'morale'),
    // New KPIs
    overall: calculateOverallScore(report),
    customerSatisfaction: statusToNumeric(report.customerSatisfaction, 'satisfaction'),
    teamKPIs: calculateTeamKPIsScore(report),
    departmentalScore: calculateDepartmentalScore(report),
  }));

  // Updated color configuration with the specified color codes
  const chartConfig = {
    risk: { label: "Risk Level", color: "#D97706" },
    financial: { label: "Financial Health", color: "#0E7490" },
    completion: { label: "Completion", color: "#10B981" },
    morale: { label: "Team Morale", color: "#EC4899" },
    // Updated New KPIs
    overall: { label: "Overall Score", color: "#1D4ED8", icon: Star },
    customerSatisfaction: { label: "Customer Satisfaction", color: "#047857", icon: Smile },
    teamKPIs: { label: "Team KPIs", color: "#CA8A04", icon: Users },
    departmentalScore: { label: "Departmental Score", color: "#7C3AED", icon: Building },
  };

  return (
    // Updated grid to grid-cols-3 with chart taking 2 columns
    <div className="grid md:grid-cols-3 gap-6">
      {/* Chart now spans 2 columns for more width */}
      <div className="md:col-span-2 h-[400px] overflow-hidden"> {/* Increased height from 300px to 400px */}
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={trendData} 
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                height={40} // Increased height for better label visibility
              />
              <YAxis 
                domain={[0, 4]} 
                ticks={[0, 1, 2, 3, 4]} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                width={30} // Set explicit width for more chart space
              />
              <Tooltip 
                content={<ChartTooltipContent />} 
                wrapperStyle={{ zIndex: 1000 }} // Ensure tooltip is visible
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              {/* Original KPIs */}
              <Line type="monotone" dataKey="risk" name="Risk Level" stroke={chartConfig.risk.color} />
              <Line type="monotone" dataKey="financial" name="Financial Health" stroke={chartConfig.financial.color} />
              
              {/* New KPIs */}
              <Line 
                type="monotone" 
                dataKey="overall" 
                name="Overall Score" 
                stroke={chartConfig.overall.color} 
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="customerSatisfaction" 
                name="Customer Satisfaction" 
                stroke={chartConfig.customerSatisfaction.color} 
              />
              <Line 
                type="monotone" 
                dataKey="teamKPIs" 
                name="Team KPIs" 
                stroke={chartConfig.teamKPIs.color} 
              />
              <Line 
                type="monotone" 
                dataKey="departmentalScore" 
                name="Departmental Score" 
                stroke={chartConfig.departmentalScore.color} 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Trend Analysis Summary with KPI Movement - now takes 1/3 of the width */}
      <div className="flex flex-col">
        <div className="border rounded-md p-6 h-full">
          <h3 className="font-semibold text-lg mb-4">Trend Analysis</h3>
          
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-medium mb-2">Performance Over Time</h4>
              <p className="text-sm text-muted-foreground">
                This chart shows how key performance indicators have changed over {trendData.length} reporting periods.
              </p>
            </div>
            
            {/* KPI Movement Summary Section */}
            <div>
              <h4 className="text-sm font-medium mb-3">KPI Movement Summary</h4>
              <div className="space-y-4">
                {improvedKPIs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Improved:</p>
                    <ul className="space-y-2">
                      {improvedKPIs.map((kpi) => (
                        <li key={kpi.name} className="flex items-center text-sm">
                          <span className="text-green-600 mr-2">↑</span>
                          <span style={{ color: chartConfig[kpi.category as keyof typeof chartConfig]?.color }}>
                            {kpi.name}
                          </span>
                          <span className="ml-2 text-green-600">(+{Math.abs(kpi.change).toFixed(1)})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {declinedKPIs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Declined:</p>
                    <ul className="space-y-2">
                      {declinedKPIs.map((kpi) => (
                        <li key={kpi.name} className="flex items-center text-sm">
                          <span className="text-red-600 mr-2">↓</span>
                          <span style={{ color: chartConfig[kpi.category as keyof typeof chartConfig]?.color }}>
                            {kpi.name}
                          </span>
                          <span className="ml-2 text-red-600">(–{Math.abs(kpi.change).toFixed(1)})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {unchangedKPIs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">No Change:</p>
                    <ul className="space-y-2">
                      {unchangedKPIs.map((kpi) => (
                        <li key={kpi.name} className="flex items-center text-sm">
                          <span className="text-gray-400 mr-2">→</span>
                          <span style={{ color: chartConfig[kpi.category as keyof typeof chartConfig]?.color }}>
                            {kpi.name}
                          </span>
                          <span className="ml-2 text-gray-500">({kpi.current.toFixed(1)})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {kpiChanges.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No comparable KPI data available between reporting periods.
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Data Points</h4>
              <p className="text-sm text-muted-foreground">
                {trendData.length} monthly reports from {formatPeriod(projectReports[0].reportingPeriod)} to {formatPeriod(projectReports[projectReports.length - 1].reportingPeriod)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
