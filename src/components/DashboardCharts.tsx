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
  CartesianGrid,
  LabelList 
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
  fullName: string;
  label: string;
}

interface DepartmentData {
  name: string;
  score: number;
  color: string;
  fullName: string;
  label: string;
}

// Helper function to determine color based on score
const getScoreColor = (score: number): string => {
  if (score >= 3.5) return "#10b981"; // Green
  if (score >= 2.5) return "#fbbf24"; // Yellow
  return "#ef4444"; // Red
};

// Helper function to determine color based on count of projects
const getCountColor = (count: number): string => {
  if (count >= 5) return "#B91C1C"; // Dark Red for 5+ projects
  if (count >= 3) return "#EF4444"; // Medium Red for 3-4 projects
  return "#F97316"; // Light Red/Orange for 1-2 projects
};

// Define color legend items
const colorTierLegend = [
  { color: "#B91C1C", label: "Critical (5+ projects)", value: 5 },
  { color: "#EF4444", label: "Warning (3-4 projects)", value: 3 },
  { color: "#F97316", label: "Caution (1-2 projects)", value: 1 }
];

export function DashboardCharts() {
  const { getFilteredProjects, selectedPeriod } = useProjectContext();
  const filteredProjects = getFilteredProjects(selectedPeriod);
  
  // Calculate underperforming KPIs with custom thresholds
  const calculateUnderperformingKPIs = (): KPIData[] => {
    const kpiFields = [
      { field: "overallProjectScore", name: "OS", fullName: "Overall Score", label: "OS" },
      { field: "riskLevel", name: "Risk Level", fullName: "Risk Level", label: "RL" },
      { field: "financialHealth", name: "Financial Health", fullName: "Financial Health", label: "FH" },
      { field: "completionOfPlannedWork", name: "Work Completion", fullName: "Completion of Planned Work", label: "CP" },
      { field: "teamMorale", name: "Team Morale", fullName: "Team Morale", label: "TM" },
      { field: "customerSatisfaction", name: "Customer Satisfaction", fullName: "Customer Satisfaction", label: "CS" }
    ];
    
    // Helper functions to convert string values to numeric for comparison
    const getKpiValue = (project: ProjectReport, field: string): number => {
      switch (field) {
        case "riskLevel":
          return project.riskLevel === "High" || project.riskLevel === "Critical" ? 1 : 
                 project.riskLevel === "Medium" ? 2 : 4;
        case "financialHealth":
          return project.financialHealth === "At Risk" || project.financialHealth === "Critical" ? 1 : 
                 project.financialHealth === "On Watch" ? 2 : 4;
        case "completionOfPlannedWork":
          return project.completionOfPlannedWork === "Not completed" ? 1 : 
                 project.completionOfPlannedWork === "Partially" ? 2 : 
                 project.completionOfPlannedWork === "Mostly" ? 3 : 4;
        case "teamMorale":
          return project.teamMorale === "Low" || project.teamMorale === "Burnt Out" ? 1 :
                 project.teamMorale === "Moderate" ? 3 : 4;
        case "customerSatisfaction":
          return project.customerSatisfaction === "Dissatisfied" ? 1 :
                 project.customerSatisfaction === "Neutral / Unclear" ? 2 :
                 project.customerSatisfaction === "Satisfied" ? 3 : 4;
        case "overallProjectScore":
          return project.overallProjectScore === "Poor" ? 1 :
                 project.overallProjectScore === "Fair" ? 2 :
                 project.overallProjectScore === "Good" ? 3 : 4;
        default:
          return 0;
      }
    };
    
    // Count KPIs using the new thresholds
    const kpiCounts = kpiFields.map(kpi => {
      let count;
      
      // Apply different logic for Risk Level (High/Critical is bad)
      if (kpi.field === "riskLevel") {
        count = filteredProjects.filter(project => {
          return project.riskLevel === "High" || project.riskLevel === "Critical";
        }).length;
      } else {
        // For all other KPIs, score <= 2 is considered underperforming
        count = filteredProjects.filter(project => {
          const value = getKpiValue(project, kpi.field);
          return value <= 2 && value > 0; // Only count if <= 2 (Poor or Fair) and not 0 (N.A.)
        }).length;
      }
      
      return {
        name: kpi.name,
        label: kpi.label,
        fullName: kpi.fullName,
        value: count,
        color: getCountColor(count) // Dynamic color based on count
      };
    });
    
    // Sort by count (descending) and filter out those with zero count
    return kpiCounts
      .filter(kpi => kpi.value > 0)
      .sort((a, b) => b.value - a.value);
  };
  
  // Calculate department performance - Updated with full names and abbreviations
  const calculateDepartmentPerformance = (): DepartmentData[] => {
    const departments = [
      { field: "frontEndQuality", name: "FE", fullName: "Front-End Team Quality", label: "FE" },
      { field: "backEndQuality", name: "BE", fullName: "Back-End Team Quality", label: "BE" },
      { field: "testingQuality", name: "TE", fullName: "Testing Team Quality", label: "TE" },
      { field: "designQuality", name: "DE", fullName: "Design Team Quality", label: "DE" },
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
  
  const kpiData = calculateUnderperformingKPIs();
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

  // Custom tooltip formatter for KPI chart
  const kpiTooltipFormatter = (value: number, name: string, props: any) => {
    const item = kpiData.find(k => k.label === name);
    if (item) {
      let colorDescription = "";
      if (item.value >= 5) colorDescription = "(Critical: 5+ projects)";
      else if (item.value >= 3) colorDescription = "(Warning: 3-4 projects)";
      else colorDescription = "(Caution: 1-2 projects)";
      
      return [
        <div className="flex flex-col">
          <span>{`${item.fullName}: ${value} projects ${colorDescription}`}</span>
        </div>,
        ''
      ];
    }
    return [value, name];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Left Column: Underperforming KPIs Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Most Common Underperforming KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          {hasKpiData ? (
            <>
              <div className="h-[300px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpiData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis
                      type="number"
                      label={{ 
                        value: "# of Projects Rated Poor or At Risk", 
                        position: "insideBottom", 
                        offset: -5,
                        fontSize: 12
                      }}
                    />
                    <YAxis 
                      dataKey="label" 
                      type="category" 
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const item = kpiData.find(k => k.label === payload.value);
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={-5}
                              y={0}
                              dy={4}
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
                      formatter={kpiTooltipFormatter}
                      labelFormatter={(label) => {
                        const item = kpiData.find(k => k.label === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Count" 
                      radius={[0, 4, 4, 0]}
                    >
                      {kpiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Color Legend */}
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-4">
                  {colorTierLegend.map((item) => (
                    <div key={item.color} className="flex items-center gap-1.5">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px] flex justify-center items-center flex-col">
              <p className="text-muted-foreground">No underperforming KPIs for this period</p>
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
