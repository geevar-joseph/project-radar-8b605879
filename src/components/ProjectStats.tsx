
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectReport, ratingToValueMap } from "@/types/project";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export function ProjectStats() {
  const { getFilteredProjects, selectedPeriod } = useProjectContext();
  const filteredProjects = getFilteredProjects(selectedPeriod);
  
  // Calculate stats
  const totalProjects = filteredProjects.length;
  const projectsByRiskLevel = {
    Low: filteredProjects.filter(p => p.riskLevel === "Low").length,
    Medium: filteredProjects.filter(p => p.riskLevel === "Medium").length,
    High: filteredProjects.filter(p => p.riskLevel === "High").length,
    Critical: filteredProjects.filter(p => p.riskLevel === "Critical").length,
  };
  
  const healthData = [
    { name: "Low Risk", value: filteredProjects.filter(p => p.riskLevel === "Low").length },
    { name: "Medium Risk", value: filteredProjects.filter(p => p.riskLevel === "Medium").length },
    { name: "High Risk", value: filteredProjects.filter(p => p.riskLevel === "High").length }
  ];
  
  const COLORS = ["#10b981", "#fbbf24", "#ef4444"];
  
  // Calculate average scores for departments
  const calcAverage = (projects: ProjectReport[], field: keyof ProjectReport) => {
    const validProjects = projects.filter(p => p[field] !== "N.A");
    if (validProjects.length === 0) return 0;
    
    const sum = validProjects.reduce((acc, project) => {
      const value = ratingToValueMap[project[field] as keyof typeof ratingToValueMap] || 0;
      return acc + value;
    }, 0);
    
    return parseFloat((sum / validProjects.length).toFixed(2));
  };
  
  const departmentData = [
    { name: "Front-End", score: calcAverage(filteredProjects, "frontEndQuality") },
    { name: "Back-End", score: calcAverage(filteredProjects, "backEndQuality") },
    { name: "Testing", score: calcAverage(filteredProjects, "testingQuality") },
    { name: "Design", score: calcAverage(filteredProjects, "designQuality") }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedPeriod ? `For period ${selectedPeriod}` : "Across all periods"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Projects by Risk</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Low:</span>
            <span className="text-sm font-medium">{projectsByRiskLevel.Low}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Medium:</span>
            <span className="text-sm font-medium">{projectsByRiskLevel.Medium}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">High:</span>
            <span className="text-sm font-medium">{projectsByRiskLevel.High}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Critical:</span>
            <span className="text-sm font-medium">{projectsByRiskLevel.Critical}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Updated chart sizes with better height and margins */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={120}> {/* Increased height from 100 to 120 */}
            <PieChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={30} 
                outerRadius={50} 
                paddingAngle={5}
                dataKey="value"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}> 
            <BarChart 
              data={departmentData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar 
                dataKey="score" 
                fill="#60a5fa" 
                barSize={18} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
