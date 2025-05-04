
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
  }
  return 0;
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
    overallScore: ratingToNumeric(report.overallProjectScore),
    risk: statusToNumeric(report.riskLevel, 'risk'),
    financial: statusToNumeric(report.financialHealth, 'financial'),
    completion: statusToNumeric(report.completionOfPlannedWork, 'completion'),
    morale: statusToNumeric(report.teamMorale, 'morale'),
    pm: ratingToNumeric(report.projectManagerEvaluation),
    frontend: ratingToNumeric(report.frontEndQuality),
    backend: ratingToNumeric(report.backEndQuality),
    testing: ratingToNumeric(report.testingQuality),
    design: ratingToNumeric(report.designQuality),
  }));

  const chartConfig = {
    overallScore: { label: "Overall Score", color: "#8B5CF6" },
    risk: { label: "Risk Level", color: "#F97316" },
    financial: { label: "Financial Health", color: "#0EA5E9" },
    completion: { label: "Completion", color: "#10B981" },
    morale: { label: "Team Morale", color: "#EC4899" },
    pm: { label: "PM Evaluation", color: "#6366F1" },
    frontend: { label: "Frontend", color: "#F43F5E" },
    backend: { label: "Backend", color: "#8B5CF6" },
    testing: { label: "Testing", color: "#14B8A6" },
    design: { label: "Design", color: "#F59E0B" },
  };

  return (
    <div className="h-[400px] overflow-hidden">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={trendData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
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
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="overallScore" 
              name="Overall Score"
              stroke={chartConfig.overallScore.color} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }} 
            />
            <Line type="monotone" dataKey="risk" name="Risk Level" stroke={chartConfig.risk.color} />
            <Line type="monotone" dataKey="financial" name="Financial Health" stroke={chartConfig.financial.color} />
            <Line type="monotone" dataKey="completion" name="Completion" stroke={chartConfig.completion.color} />
            <Line type="monotone" dataKey="morale" name="Team Morale" stroke={chartConfig.morale.color} />
            <Line type="monotone" dataKey="pm" name="PM Evaluation" stroke={chartConfig.pm.color} />
            <Line type="monotone" dataKey="frontend" name="Frontend" stroke={chartConfig.frontend.color} />
            <Line type="monotone" dataKey="backend" name="Backend" stroke={chartConfig.backend.color} />
            <Line type="monotone" dataKey="testing" name="Testing" stroke={chartConfig.testing.color} />
            <Line type="monotone" dataKey="design" name="Design" stroke={chartConfig.design.color} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
