
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

// Define types for our KPI data
interface KPIData {
  name: string;
  value: number;
  color: string;
}

interface DepartmentData {
  name: string;
  score: number;
  color: string;
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
  
  // Calculate low-performing KPIs
  const calculateLowPerformingKPIs = (): KPIData[] => {
    const kpiFields = [
      { field: "frontEndQuality", name: "Front-End", color: "#60a5fa" },
      { field: "backEndQuality", name: "Back-End", color: "#8b5cf6" },
      { field: "testingQuality", name: "Testing", color: "#f97316" },
      { field: "designQuality", name: "Design", color: "#ec4899" },
      { field: "projectManagerEvaluation", name: "PM Performance", color: "#14b8a6" }
    ];
    
    return kpiFields.map(kpi => {
      const lowPerforming = filteredProjects.filter(project => 
        project[kpi.field as keyof ProjectReport] === "Poor" || 
        project[kpi.field as keyof ProjectReport] === "Fair"
      ).length;
      
      return {
        name: kpi.name,
        value: lowPerforming,
        color: kpi.color
      };
    }).filter(kpi => kpi.value > 0);  // Only keep KPIs with low-performing projects
  };
  
  // Calculate department performance
  const calculateDepartmentPerformance = (): DepartmentData[] => {
    const departments = [
      { field: "frontEndQuality", name: "Front-End" },
      { field: "backEndQuality", name: "Back-End" },
      { field: "testingQuality", name: "Testing" },
      { field: "designQuality", name: "Design" }
    ];
    
    return departments.map(dept => {
      const validProjects = filteredProjects.filter(
        p => p[dept.field as keyof ProjectReport] !== "N.A."
      );
      
      if (validProjects.length === 0) {
        return {
          name: dept.name,
          score: 0,
          color: "#d1d5db" // Gray for no data
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
        score: avgScore,
        color
      };
    });
  };
  
  const kpiData = calculateLowPerformingKPIs();
  const departmentData = calculateDepartmentPerformance();
  
  // Handle empty data
  const hasKpiData = kpiData.length > 0;
  const hasDepartmentData = departmentData.some(d => d.score > 0);

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
    frontEnd: { color: "#60a5fa" },
    backEnd: { color: "#8b5cf6" },
    testing: { color: "#f97316" },
    design: { color: "#ec4899" },
    pmPerformance: { color: "#14b8a6" }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Left Column: KPI Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Low-Performing KPIs This Month</CardTitle>
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
                  <Tooltip formatter={(value) => [`${value} Projects`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex justify-center items-center flex-col">
              <p className="text-muted-foreground">No low-performing KPIs for this period</p>
              <p className="text-sm text-muted-foreground">All KPIs are performing well</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Right Column: Department-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Department-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {hasDepartmentData ? (
            <div className="h-[300px]">
              <ChartContainer 
                className="h-[300px]" 
                config={chartConfig}
              >
                <BarChart data={departmentData} layout="vertical">
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
                    width={80} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} (${getRatingLabel(Number(value))})`, 'Score']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Bar 
                    dataKey="score" 
                    radius={[0, 4, 4, 0]}
                  >
                    {departmentData.map((entry, index) => (
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
