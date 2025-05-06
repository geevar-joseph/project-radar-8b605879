
import React, { useState, useEffect } from 'react';
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
  PolarRadiusAxis,
  Cell
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
import { ChartBar, ChartLine, Radar as RadarIcon, Info } from "lucide-react";
import { ProjectKPITrendChart } from './ProjectKPITrendChart';
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatPeriodForChart } from '@/utils/formatPeriods';
import { SearchableSelect } from "@/components/SearchableSelect";
import { formatPeriod } from '@/utils/formatPeriods';

interface ProjectKPIChartProps {
  project: ProjectReport;
  initialPeriod?: string;
  setParentPeriod?: (period: string) => void;
  availablePeriods?: string[];
}

// Helper function to convert rating to numeric value
const ratingToNumeric = (rating: RatingValue) => {
  return ratingToValueMap[rating] || 0;
};

type ChartViewType = 'bar' | 'radar' | 'line';

export const ProjectKPIChart: React.FC<ProjectKPIChartProps> = ({ 
  project, 
  initialPeriod,
  setParentPeriod,
  availablePeriods: propAvailablePeriods
}) => {
  const { projects, availablePeriods: contextAvailablePeriods } = useProjectContext();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod || project.reportingPeriod);
  const [chartView, setChartView] = useState<ChartViewType>('bar');
  
  const availablePeriods = propAvailablePeriods || contextAvailablePeriods;
  
  // Get all reports for the current project
  const projectReports = projects.filter(p => p.projectName === project.projectName);
  
  // Get unique reporting periods for this project
  const reportingPeriods = [...new Set(projectReports.map(p => p.reportingPeriod))];
  
  // Get the selected report
  const selectedReport = projectReports.find(p => p.reportingPeriod === selectedPeriod) || project;
  
  // Update local period when prop changes
  useEffect(() => {
    if (initialPeriod) {
      setSelectedPeriod(initialPeriod);
    }
  }, [initialPeriod]);

  // Handle period selection change
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    // Update parent component's period if callback provided
    if (setParentPeriod) {
      setParentPeriod(newPeriod);
    }
  };
  
  // Format periods for the searchable select component
  const periodOptions = availablePeriods
    .filter(period => period !== "N/A")
    .map(period => ({
      value: period,
      label: formatPeriod(period)
    }));
  
  // Use the utility function from formatPeriods.ts
  const formatPeriodDisplay = (periodString: string) => {
    if (!periodString || periodString === 'N/A') {
      return 'N/A';
    }
    
    // Check if the period is in the expected format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(periodString)) {
      return periodString;
    }
    
    try {
      const [year, month] = periodString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      if (isNaN(date.getTime())) {
        return periodString;
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
      }).format(date);
    } catch (error) {
      console.error('Error formatting period:', error, periodString);
      return periodString;
    }
  };
  
  const chartConfig = {
    // Updated chart config with consistent naming and colors
    risk: { label: "Risk Level", color: "#F97316" },
    financial: { label: "Financial Health", color: "#0EA5E9" },
    completion: { label: "Completion of Planned Work", color: "#10B981" },
    morale: { label: "Team Morale", color: "#EC4899" },
    pm: { label: "Project Manager Self-Evaluation", color: "#6366F1" },
    frontend: { label: "Front-End Team Quality", color: "#F43F5E" },
    backend: { label: "Back-End Team Quality", color: "#8B5CF6" },
    testing: { label: "Testing Team Quality", color: "#14B8A6" },
    design: { label: "Design Team Quality", color: "#F59E0B" },
    customer: { label: "Customer Satisfaction", color: "#84CC16" },
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

  // Convert customer satisfaction to numeric
  const satisfactionToNumeric = (satisfaction: string) => {
    switch (satisfaction) {
      case 'Very Satisfied': return 4;
      case 'Satisfied': return 3;
      case 'Neutral / Unclear': return 2;
      case 'Dissatisfied': return 1;
      default: return 0;
    }
  };

  // Updated chart data with consistent labels, full names, and abbreviations
  const chartData = [
    {
      name: "RL", // Abbreviated label
      fullName: "Risk Level", // Full name for tooltips/legends
      category: "risk",
      value: riskToNumeric(selectedReport.riskLevel),
      fill: chartConfig.risk.color
    },
    {
      name: "FH",
      fullName: "Financial Health",
      category: "financial",
      value: financialToNumeric(selectedReport.financialHealth),
      fill: chartConfig.financial.color
    },
    {
      name: "CP",
      fullName: "Completion of Planned Work",
      category: "completion",
      value: completionToNumeric(selectedReport.completionOfPlannedWork),
      fill: chartConfig.completion.color
    },
    {
      name: "TM",
      fullName: "Team Morale",
      category: "morale",
      value: moraleToNumeric(selectedReport.teamMorale),
      fill: chartConfig.morale.color
    },
    {
      name: "PM",
      fullName: "Project Manager Self-Evaluation",
      category: "pm",
      value: ratingToNumeric(selectedReport.projectManagerEvaluation),
      fill: chartConfig.pm.color
    },
    {
      name: "FE",
      fullName: "Front-End Team Quality",
      category: "frontend",
      value: ratingToNumeric(selectedReport.frontEndQuality),
      fill: chartConfig.frontend.color
    },
    {
      name: "BE",
      fullName: "Back-End Team Quality",
      category: "backend",
      value: ratingToNumeric(selectedReport.backEndQuality),
      fill: chartConfig.backend.color
    },
    {
      name: "TE",
      fullName: "Testing Team Quality",
      category: "testing",
      value: ratingToNumeric(selectedReport.testingQuality),
      fill: chartConfig.testing.color
    },
    {
      name: "DE",
      fullName: "Design Team Quality",
      category: "design",
      value: ratingToNumeric(selectedReport.designQuality),
      fill: chartConfig.design.color
    },
    {
      name: "CS",
      fullName: "Customer Satisfaction",
      category: "customer",
      value: satisfactionToNumeric(selectedReport.customerSatisfaction),
      fill: chartConfig.customer.color
    }
  ].filter(item => item.value > 0); // Only include items with values

  // Calculate key performance stats for the summary panel - fix the calculation
  const validScores = chartData.filter(item => item.value > 0);
  const avgScore = validScores.length > 0 
    ? validScores.reduce((sum, item) => sum + item.value, 0) / validScores.length
    : 0;
    
  const topPerformers = [...chartData].sort((a, b) => b.value - a.value).slice(0, 3);
  const improvementAreas = [...chartData].sort((a, b) => a.value - b.value).slice(0, 3);

  // Helper for formatting rating labels
  const getRatingLabel = (value: number): string => {
    if (value >= 3.5) return "Excellent";
    if (value >= 2.5) return "Good"; 
    if (value >= 1.5) return "Fair";
    return "Poor";
  };

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
          
          <SearchableSelect
            value={selectedPeriod || ""}
            onValueChange={handlePeriodChange}
            placeholder="Select Period"
            options={periodOptions}
            emptyMessage="No periods found"
            width="w-[200px]"
          />
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
        
        <SearchableSelect
          value={selectedPeriod || ""}
          onValueChange={handlePeriodChange}
          placeholder="Select Period"
          options={periodOptions}
          emptyMessage="No periods found"
          width="w-[200px]"
        />
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
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => {
                      const item = chartData.find(d => d.name === name);
                      return [
                        `${value} (${getRatingLabel(value)})`,
                        item?.fullName || name
                      ];
                    }}
                  />
                  <Legend 
                    formatter={(value, entry, index) => {
                      const item = chartData.find(d => d.name === value);
                      return (
                        <HoverCard>
                          <HoverCardTrigger className="cursor-help">
                            <span>{value}</span>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-2">
                            <span className="text-xs">{item?.fullName}</span>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    }}
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: "#555" }}
                    tickFormatter={(value) => value}
                  />
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
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      const item = chartData.find(d => d.name === name);
                      return [
                        `${value} (${getRatingLabel(value)})`,
                        item?.fullName || name
                      ];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value, entry, index) => {
                      const item = chartData.find(d => d.name === value);
                      return (
                        <HoverCard>
                          <HoverCardTrigger className="cursor-help">
                            <span>{value}</span>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-2">
                            <span className="text-xs">{item?.fullName}</span>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>

        {/* Performance Summary Panel - Updated with accurate full names */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Performance Summary</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info size={16} className="text-muted-foreground cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Abbreviation Legend:</p>
                      <ul className="text-xs space-y-1">
                        {chartData.map((item) => (
                          <li key={item.name} className="flex justify-between">
                            <span>{item.name}:</span>
                            <span className="font-medium">{item.fullName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
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
                        <span className="text-sm flex items-center">
                          <span className="font-medium mr-1">{item.name}</span>
                          <span className="text-xs text-muted-foreground">({item.fullName})</span>
                        </span>
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
                        <span className="text-sm flex items-center">
                          <span className="font-medium mr-1">{item.name}</span>
                          <span className="text-xs text-muted-foreground">({item.fullName})</span>
                        </span>
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
                  <p className="text-sm font-medium">{formatPeriodDisplay(selectedPeriod)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
