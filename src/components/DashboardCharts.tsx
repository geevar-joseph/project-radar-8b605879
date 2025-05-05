
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ratingToValueMap, ProjectReport } from "@/types/project";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

// Define types for our KPI data
interface KPIData {
  name: string;
  value: number;
  color: string;
  fullName: string; // Added full name for consistency
}

interface DepartmentData {
  name: string;
  score: number;
  color: string;
  fullName: string; // Added full name for consistency
  label: string; // Abbreviated label
}

// Helper function to determine color based on score
const getScoreColor = (score: number): string => {
  if (score >= 3.5) return "#10b981"; // Green
  if (score >= 2.5) return "#fbbf24"; // Yellow
  return "#ef4444"; // Red
};

export function DashboardCharts() {
  const { getFilteredProjects, selectedPeriod } = useProjectContext();
  const filteredProjects = getFilteredProjects(selectedPeriod);
  
  // Calculate low-performing KPIs - Updated to show only the specified metrics
  const calculateProjectHealthIndicators = (): KPIData[] => {
    const kpiFields = [
      { field: "overallProjectScore", name: "Overall Score", color: "#60a5fa", fullName: "Overall Project Score", poorValues: ["Fair", "Poor"] },
      { field: "riskLevel", name: "Risk Level", color: "#ef4444", fullName: "Risk Level", poorValues: ["Medium", "High"] },
      { field: "financialHealth", name: "Financial Health", color: "#8b5cf6", fullName: "Financial Health", poorValues: ["On Watch", "At Risk"] },
      { field: "completionOfPlannedWork", name: "Work Completion", color: "#f97316", fullName: "Completion of Planned Work", poorValues: ["Partially", "Not completed"] },
      { field: "teamMorale", name: "Team Morale", color: "#14b8a6", fullName: "Team Morale", poorValues: ["Low"] }
    ];
    
    return kpiFields.map(kpi => {
      const lowPerforming = filteredProjects.filter(project => 
        kpi.poorValues.includes(project[kpi.field as keyof ProjectReport] as string)
      ).length;
      
      return {
        name: kpi.name,
        fullName: kpi.fullName,
        value: lowPerforming,
        color: kpi.color
      };
    }).filter(kpi => kpi.value > 0);  // Only keep KPIs with issues
  };
  
  // Calculate department performance - Updated with full names and abbreviations
  const calculateDepartmentPerformance = (): DepartmentData[] => {
    const departments = [
      { field: "frontEndQuality", name: "FE", fullName: "Front-End Team Quality", label: "FE" },
      { field: "backEndQuality", name: "BE", fullName: "Back-End Team Quality", label: "BE" },
      { field: "testingQuality", name: "TE", fullName: "Testing Team Quality", label: "TE" },
      { field: "designQuality", name: "DE", fullName: "Design Team Quality", label: "DE" },
      { field: "projectManagerEvaluation", name: "PM", fullName: "Project Manager Self-Evaluation", label: "PM" },
      { field: "completionOfPlannedWork", name: "CP", fullName: "Completion of Planned Work", label: "CP" },
      { field: "teamMorale", name: "TM", fullName: "Team Morale", label: "TM" },
      { field: "customerSatisfaction", name: "CS", fullName: "Customer Satisfaction", label: "CS" }
    ];
    
    return departments.map(dept => {
      const validProjects = filteredProjects.filter(
        p => p[dept.field as keyof ProjectReport] !== "N.A."
      );
      
      if (validProjects.length === 0) {
        return {
          name: dept.name,
          fullName: dept.fullName,
          score: 0,
          color: "#d1d5db", // Gray for no data
          label: dept.label
        };
      }
      
      const sum = validProjects.reduce((acc, project) => {
        const value = ratingToValueMap[project[dept.field as keyof ProjectReport] as keyof typeof ratingToValueMap] || 0;
        return acc + value;
      }, 0);
      
      const avgScore = parseFloat((sum / validProjects.length).toFixed(2));
      const color = getScoreColor(avgScore);
      
      return {
        name: dept.name,
        fullName: dept.fullName,
        score: avgScore,
        color,
        label: dept.label
      };
    });
  };
  
  const kpiData = calculateProjectHealthIndicators();
  const departmentData = calculateDepartmentPerformance();
  
  // Filter out departmentData with no score (0) for display in the chart
  const validDepartmentData = departmentData.filter(d => d.score > 0);
  
  // Handle empty data
  const hasKpiData = kpiData.length > 0;
  const hasDepartmentData = validDepartmentData.length > 0;

  // Helper to get proper rating label based on score
  const getRatingLabel = (score: number): string => {
    if (score >= 3.5) return "Excellent";
    if (score >= 2.5) return "Good";
    if (score >= 1.5) return "Fair";
    if (score > 0) return "Poor";
    return "No Data";
  };

  // Calculate overall average from all valid department scores
  const calculateOverallScore = (data: DepartmentData[]): number => {
    const validScores = data.filter(item => item.score > 0);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, item) => acc + item.score, 0);
    return parseFloat((sum / validScores.length).toFixed(1));
  };

  // Get the overall score for the summary panel
  const overallScore = calculateOverallScore(validDepartmentData);

  // Get top performers and areas needing improvement
  const topPerformers = [...validDepartmentData].sort((a, b) => b.score - a.score).slice(0, 3);
  const improvementAreas = [...validDepartmentData].sort((a, b) => a.score - b.score).slice(0, 3);

  const chartConfig = {
    excellent: { color: "#10b981" }, // green
    good: { color: "#60a5fa" }, // blue
    fair: { color: "#fbbf24" }, // yellow
    poor: { color: "#ef4444" }, // red
    na: { color: "#d1d5db" }, // gray
    frontEnd: { color: "#F43F5E" }, // Keep original
    backEnd: { color: "#8B5CF6" },  // Keep original
    testing: { color: "#F97316" },  // Keep original
    design: { color: "#EC4899" },   // Keep original
    pmPerformance: { color: "#14B8A6" } // Keep original
  };

  // Custom tooltip formatter for department chart
  const departmentTooltipFormatter = (value: number, name: string, props: any) => {
    const item = departmentData.find(d => d.name === name);
    if (item) {
      return [
        <div className="flex flex-col">
          <span>{`${item.fullName}: ${value}`}</span>
          <span className="text-xs text-muted-foreground">{`Rating: ${getRatingLabel(value)}`}</span>
        </div>,
        ''
      ];
    }
    return [value, name];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Left Column: Project Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Project Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          {hasKpiData ? (
            <div className="h-[300px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpiData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {kpiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const item = kpiData.find(k => k.name === name);
                      return [`${value} Projects`, item?.fullName || name];
                    }} 
                  />
                  <Legend 
                    formatter={(value, entry, index) => {
                      const item = kpiData.find(k => k.name === value);
                      return (
                        <span title={item?.fullName || value}>{value}</span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex justify-center items-center flex-col">
              <p className="text-muted-foreground">No health indicators with issues for this period</p>
              <p className="text-sm text-muted-foreground">All project health metrics are positive</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Right Column: Department-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            Department-wise Performance
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info size={16} className="text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Abbreviation Legend:</p>
                  <ul className="text-xs space-y-1">
                    {departmentData.map((dept) => (
                      <li key={dept.name} className="flex justify-between">
                        <span>{dept.label}:</span>
                        <span className="font-medium">{dept.fullName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasDepartmentData ? (
            <div className="h-[300px]">
              <ChartContainer 
                className="h-[300px]" 
                config={chartConfig}
              >
                <BarChart data={validDepartmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 4]} 
                    tickCount={5}
                    tickFormatter={(value) => value.toString()} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={30} 
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const item = departmentData.find(d => d.name === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text 
                            x={0} 
                            y={0} 
                            dy={5} 
                            textAnchor="end" 
                            fill="#666"
                            fontSize={12}
                          >
                            <title>{item?.fullName || payload.value}</title>
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip 
                    formatter={departmentTooltipFormatter}
                    labelFormatter={(label) => {
                      const item = departmentData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    name="Score"
                    radius={[0, 4, 4, 0]}
                  >
                    {validDepartmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[300px] flex justify-center items-center">
              <p className="text-muted-foreground">No department data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
