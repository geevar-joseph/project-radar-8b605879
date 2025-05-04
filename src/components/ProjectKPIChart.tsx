
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  ProjectReport, 
  ratingToValueMap,
  RatingValue 
} from '@/types/project';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectContext } from "@/context/ProjectContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartBar, ChartLine, Radar as RadarIcon } from "lucide-react";
import { ProjectKPITrendChart } from './ProjectKPITrendChart';
import { Card, CardContent, CardDescription } from "@/components/ui/card";

interface ProjectKPIChartProps {
  project: ProjectReport;
}

// Helper function to convert rating to numeric value
const ratingToNumeric = (rating: RatingValue) => {
  return ratingToValueMap[rating] || 0;
};

type ChartViewType = 'bar' | 'radar' | 'line';

export const ProjectKPIChart: React.FC<ProjectKPIChartProps> = ({ project }) => {
  const { projects } = useProjectContext();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(project.reportingPeriod);
  const [chartView, setChartView] = useState<ChartViewType>('bar');
  
  // Get all reports for the current project
  const projectReports = projects.filter(p => p.projectName === project.projectName);
  
  // Get unique reporting periods for this project
  const reportingPeriods = [...new Set(projectReports.map(p => p.reportingPeriod))];
  
  // Get the selected report
  const selectedReport = projectReports.find(p => p.reportingPeriod === selectedPeriod) || project;
  
  // Format the period for display
  const formatPeriod = (periodString: string) => {
    const [year, month] = periodString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };
  
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
      value: ratingToNumeric(selectedReport.overallProjectScore),
      fill: chartConfig.overallScore.color,
      label: "OS"
    },
    {
      name: "Risk",
      category: "risk",
      value: riskToNumeric(selectedReport.riskLevel),
      fill: chartConfig.risk.color,
      label: "RL"
    },
    {
      name: "Financial",
      category: "financial",
      value: financialToNumeric(selectedReport.financialHealth),
      fill: chartConfig.financial.color,
      label: "FH"
    },
    {
      name: "Completion",
      category: "completion",
      value: completionToNumeric(selectedReport.completionOfPlannedWork),
      fill: chartConfig.completion.color,
      label: "CP"
    },
    {
      name: "Morale",
      category: "morale",
      value: moraleToNumeric(selectedReport.teamMorale),
      fill: chartConfig.morale.color,
      label: "TM"
    },
    {
      name: "PM",
      category: "pm",
      value: ratingToNumeric(selectedReport.projectManagerEvaluation),
      fill: chartConfig.pm.color,
      label: "PM"
    },
    {
      name: "Frontend",
      category: "frontend",
      value: ratingToNumeric(selectedReport.frontEndQuality),
      fill: chartConfig.frontend.color,
      label: "FE"
    },
    {
      name: "Backend",
      category: "backend",
      value: ratingToNumeric(selectedReport.backEndQuality),
      fill: chartConfig.backend.color,
      label: "BE"
    },
    {
      name: "Testing",
      category: "testing",
      value: ratingToNumeric(selectedReport.testingQuality),
      fill: chartConfig.testing.color,
      label: "TE"
    },
    {
      name: "Design",
      category: "design",
      value: ratingToNumeric(selectedReport.designQuality),
      fill: chartConfig.design.color,
      label: "DE"
    }
  ];

  // Calculate key performance stats for the summary panel
  const avgScore = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;
  const topPerformers = [...chartData].sort((a, b) => b.value - a.value).slice(0, 3);
  const improvementAreas = [...chartData].sort((a, b) => a.value - b.value).slice(0, 3);

  // Render line chart view (trends over time)
  if (chartView === 'line') {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row justify-between mb-4">
          <ToggleGroup type="single" value={chartView} onValueChange={(value) => value && setChartView(value as ChartViewType)}>
            <ToggleGroupItem value="bar" aria-label="Bar Chart">
              <ChartBar className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Bar</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="radar" aria-label="Radar Chart">
              <RadarIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Radar</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line Chart">
              <ChartLine className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Trend</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ProjectKPITrendChart projectName={project.projectName} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row justify-between mb-4">
        <ToggleGroup type="single" value={chartView} onValueChange={(value) => value && setChartView(value as ChartViewType)}>
          <ToggleGroupItem value="bar" aria-label="Bar Chart">
            <ChartBar className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Bar</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="radar" aria-label="Radar Chart">
            <RadarIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Radar</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="line" aria-label="Line Chart">
            <ChartLine className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Trend</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Select 
          value={selectedPeriod} 
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {reportingPeriods.map((period) => (
              <SelectItem key={period} value={period}>
                {formatPeriod(period)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[400px] overflow-hidden">
          <ChartContainer config={chartConfig}>
            {chartView === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    <LabelList dataKey="label" position="top" fill="#333" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: "#555" }} />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 4]} 
                    tickCount={5} 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar 
                    name="KPI Rating" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>

        {/* Performance Summary Panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Performance Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(avgScore / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium text-sm">{avgScore.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Performing Areas</p>
                  <ul className="space-y-2">
                    {topPerformers.map((item) => (
                      <li key={`top-${item.name}`} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${(item.value / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{item.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Areas for Improvement</p>
                  <ul className="space-y-2">
                    {improvementAreas.map((item) => (
                      <li key={`imp-${item.name}`} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full" 
                              style={{ width: `${(item.value / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{item.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reporting Period</p>
                  <p className="text-sm font-medium">{formatPeriod(selectedPeriod)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
