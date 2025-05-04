
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ProjectReport, 
  ratingToValueMap,
  RatingValue 
} from '@/types/project';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ProjectKPIChartProps {
  project: ProjectReport;
}

// Helper function to convert rating to numeric value
const ratingToNumeric = (rating: RatingValue) => {
  return ratingToValueMap[rating] || 0;
};

export const ProjectKPIChart: React.FC<ProjectKPIChartProps> = ({ project }) => {
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
  
  // Convert risk level to numeric
  const riskToNumeric = (risk: string) => {
    switch (risk) {
      case 'Low': return 4;
      case 'Medium': return 2;
      case 'High': return 1;
      default: return 0;
    }
  };
  
  // Convert financial health to numeric
  const financialToNumeric = (health: string) => {
    switch (health) {
      case 'Healthy': return 4;
      case 'On Watch': return 2;
      case 'At Risk': return 1;
      default: return 0;
    }
  };
  
  // Convert completion status to numeric
  const completionToNumeric = (status: string) => {
    switch (status) {
      case 'All completed': return 4;
      case 'Mostly': return 3;
      case 'Partially': return 2;
      case 'Not completed': return 1;
      default: return 0;
    }
  };
  
  // Convert team morale to numeric
  const moraleToNumeric = (morale: string) => {
    switch (morale) {
      case 'High': return 4;
      case 'Moderate': return 3;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const chartData = [
    {
      name: "Overall",
      category: "overallScore",
      value: ratingToNumeric(project.overallProjectScore),
      fill: chartConfig.overallScore.color
    },
    {
      name: "Risk",
      category: "risk",
      value: riskToNumeric(project.riskLevel),
      fill: chartConfig.risk.color
    },
    {
      name: "Financial",
      category: "financial",
      value: financialToNumeric(project.financialHealth),
      fill: chartConfig.financial.color
    },
    {
      name: "Completion",
      category: "completion",
      value: completionToNumeric(project.completionOfPlannedWork),
      fill: chartConfig.completion.color
    },
    {
      name: "Morale",
      category: "morale",
      value: moraleToNumeric(project.teamMorale),
      fill: chartConfig.morale.color
    },
    {
      name: "PM",
      category: "pm",
      value: ratingToNumeric(project.projectManagerEvaluation),
      fill: chartConfig.pm.color
    },
    {
      name: "Frontend",
      category: "frontend",
      value: ratingToNumeric(project.frontEndQuality),
      fill: chartConfig.frontend.color
    },
    {
      name: "Backend",
      category: "backend",
      value: ratingToNumeric(project.backEndQuality),
      fill: chartConfig.backend.color
    },
    {
      name: "Testing",
      category: "testing",
      value: ratingToNumeric(project.testingQuality),
      fill: chartConfig.testing.color
    },
    {
      name: "Design",
      category: "design",
      value: ratingToNumeric(project.designQuality),
      fill: chartConfig.design.color
    }
  ];

  return (
    <div className="w-full h-80">
      <ChartContainer config={chartConfig}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
