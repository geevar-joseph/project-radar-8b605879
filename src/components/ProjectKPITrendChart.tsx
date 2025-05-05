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

interface ProjectKPITrendChartProps {
  projectName: string;
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

// Calculate overall score from a report
const calculateOverallScore = (report: ProjectReport): number => {
  // If the report already has an overall score that's not "N.A." or "N/A", convert it to numeric
  if (report.overallProjectScore && 
      !["N.A.", "N/A", "", "0.0", "0"].includes(report.overallProjectScore)) {
    // If it's a numeric string like "3.5", parse it
    const numericScore = parseFloat(report.overallProjectScore);
    if (!isNaN(numericScore) && numericScore > 0 && numericScore <= 4) {
      return numericScore;
    }
  }
  
  // Otherwise calculate from individual scores
  const scores = [
    statusToNumeric(report.completionOfPlannedWork, 'completion'),
    statusToNumeric(report.teamMorale, 'morale'),
    statusToNumeric(report.customerSatisfaction, 'satisfaction'),
    ratingToNumeric(report.projectManagerEvaluation),
    ratingToNumeric(report.frontEndQuality),
    ratingToNumeric(report.backEndQuality),
    ratingToNumeric(report.testingQuality),
    ratingToNumeric(report.designQuality)
  ];
  
  // Filter out zero values
  const validScores = scores.filter(score => score > 0);
  
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

export const ProjectKPITrendChart: React.FC<ProjectKPITrendChartProps> = ({ projectName }) => {
  const { projects } = useProjectContext();
  
  // Filter reports for this project and sort by reporting period
  const projectReports = projects
    .filter(p => p.projectName === projectName)
    .sort((a, b) => a.reportingPeriod.localeCompare(b.reportingPeriod));
  
  if (projectReports.length < 2) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Not enough data for trend analysis</p>
      </div>
    );
  }

  // Format reporting period for better display
  const formatPeriod = (periodString: string) => {
    const [year, month] = periodString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
  };

  // Prepare data for the line chart
  const trendData = projectReports.map(report => ({
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

  const chartConfig = {
    risk: { label: "Risk Level", color: "#F97316" },
    financial: { label: "Financial Health", color: "#0EA5E9" },
    completion: { label: "Completion", color: "#10B981" },
    morale: { label: "Team Morale", color: "#EC4899" },
    // New KPIs
    overall: { label: "Overall Score", color: "#8B5CF6", icon: Star },
    customerSatisfaction: { label: "Customer Satisfaction", color: "#84CC16", icon: Smile },
    teamKPIs: { label: "Team KPIs", color: "#F59E0B", icon: Users },
    departmentalScore: { label: "Departmental Score", color: "#6366F1", icon: Building },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="h-[400px] overflow-hidden">
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
              />
              <YAxis 
                domain={[0, 4]} 
                ticks={[0, 1, 2, 3, 4]} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip content={<ChartTooltipContent />} />
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

      {/* Trend Analysis Summary */}
      <div className="flex flex-col">
        <div className="border rounded-md p-6 h-full">
          <h3 className="font-semibold text-lg mb-4">Trend Analysis</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Performance Over Time</h4>
              <p className="text-sm text-muted-foreground">
                This chart shows how key performance indicators have changed over {trendData.length} reporting periods.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">KPI Timeline Highlights</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><span className="font-medium" style={{ color: chartConfig.overall.color }}>Overall Score</span> - Project's aggregate performance</li>
                <li><span className="font-medium" style={{ color: chartConfig.customerSatisfaction.color }}>Customer Satisfaction</span> - Client feedback trends</li>
                <li><span className="font-medium" style={{ color: chartConfig.teamKPIs.color }}>Team KPIs</span> - Team morale and PM performance</li>
                <li><span className="font-medium" style={{ color: chartConfig.departmentalScore.color }}>Departmental Score</span> - Technical quality metrics</li>
                <li><span className="font-medium" style={{ color: chartConfig.risk.color }}>Risk Level</span> - Project risk assessment</li>
              </ul>
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
