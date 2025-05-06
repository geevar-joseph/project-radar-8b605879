
import { useEffect, useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, AlertTriangle, XOctagon, Clock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ProjectStats } from "@/components/ProjectStats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MissingReportsBlock } from "@/components/MissingReportsBlock";
import { ComplianceTable } from "@/components/ComplianceTable";
import { formatPeriod } from "@/utils/formatPeriods";
import { SearchableSelect } from "@/components/SearchableSelect";
import { ProjectReport } from "@/types/project";

const Dashboard = () => {
  const { 
    getFilteredProjectsSync,
    availablePeriods,
    selectedPeriod, 
    setSelectedPeriod,
    projectNames,
    loadAllPeriods
  } = useProjectContext();
  
  const filteredProjects = getFilteredProjectsSync(selectedPeriod);
  
  // Load all available periods when dashboard mounts
  useEffect(() => {
    loadAllPeriods();
  }, []);
  
  // High risk projects are those with "High" or "Critical" risk level
  const highRiskProjects = filteredProjects.filter(
    p => p.riskLevel === "High" || p.riskLevel === "Critical"
  );
  
  // Projects with financial health issues
  const financialIssueProjects = filteredProjects.filter(
    p => p.financialHealth === "At Risk" || p.financialHealth === "Critical"
  );
  
  // Projects with low team morale
  const lowMoraleProjects = filteredProjects.filter(
    p => p.teamMorale === "Low" || p.teamMorale === "Burnt Out"
  );
  
  // Total number of projects in the system (based on project names)
  const totalProjects = projectNames.length;
  
  // Projects missing reports for the selected period
  const missingReportsCount = totalProjects - filteredProjects.length;
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-muted-foreground">Overview of all projects and their health</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-64">
            <SearchableSelect
              options={availablePeriods.map(period => ({
                label: formatPeriod(period),
                value: period
              }))}
              value={selectedPeriod || ''}
              onValueChange={value => setSelectedPeriod(value as string)}
              placeholder="Select period..."
              label="Reporting Period"
            />
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/submit-report">Submit Report</Link>
          </Button>
        </div>
      </div>
      
      {/* Projects stats section */}
      <ProjectStats />
      
      {/* KPI Charts and Analysis */}
      <DashboardCharts />
      
      {/* Project Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">High Risk Projects</h3>
              <p className="text-3xl font-semibold mt-2">{highRiskProjects.length}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          {highRiskProjects.length > 0 ? (
            <ScrollArea className="h-52 mt-4">
              <div className="space-y-2">
                {highRiskProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-2">
                    <Link to={`/project/${project.id}`} className="text-sm font-medium hover:underline">
                      {project.projectName}
                    </Link>
                    <StatusBadge value={project.riskLevel} type="risk" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Check className="h-8 w-8 mb-2 text-green-500" />
              <p>No high risk projects</p>
            </div>
          )}
        </div>
        
        <div className="border rounded-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">Financial Issues</h3>
              <p className="text-3xl font-semibold mt-2">{financialIssueProjects.length}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <XOctagon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          {financialIssueProjects.length > 0 ? (
            <ScrollArea className="h-52 mt-4">
              <div className="space-y-2">
                {financialIssueProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-2">
                    <Link to={`/project/${project.id}`} className="text-sm font-medium hover:underline">
                      {project.projectName}
                    </Link>
                    <StatusBadge value={project.financialHealth} type="health" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Check className="h-8 w-8 mb-2 text-green-500" />
              <p>No financial issues</p>
            </div>
          )}
        </div>
        
        <div className="border rounded-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">Low Team Morale</h3>
              <p className="text-3xl font-semibold mt-2">{lowMoraleProjects.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {lowMoraleProjects.length > 0 ? (
            <ScrollArea className="h-52 mt-4">
              <div className="space-y-2">
                {lowMoraleProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-2">
                    <Link to={`/project/${project.id}`} className="text-sm font-medium hover:underline">
                      {project.projectName}
                    </Link>
                    <StatusBadge value={project.teamMorale} type="morale" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Check className="h-8 w-8 mb-2 text-green-500" />
              <p>No morale issues</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Missing Reports */}
      {missingReportsCount > 0 && selectedPeriod && (
        <div className="mb-8 p-6 border rounded-md bg-amber-50">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Missing Reports: {missingReportsCount}</h2>
          <p className="text-amber-800 mb-4">
            There are {missingReportsCount} projects that have not submitted reports for the period {selectedPeriod}.
          </p>
          
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {projectNames
                .filter(name => !filteredProjects.some(p => p.projectName === name))
                .map((name, index) => (
                  <div key={index} className="text-sm text-amber-800 p-1 border-b border-amber-200">
                    {name}
                  </div>
                ))}
            </div>
          </ScrollArea>
          
          <div className="mt-4">
            <Button variant="default" asChild>
              <Link to="/submit-report">Submit Missing Reports</Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Compliance Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Project Compliance</h2>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Project</th>
                <th className="p-3 text-left font-medium">Last Report</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Risk Level</th>
                <th className="p-3 text-left font-medium">Financial Health</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="p-3">
                    <Link to={`/project/${project.id}`} className="font-medium hover:underline">
                      {project.projectName}
                    </Link>
                  </td>
                  <td className="p-3 text-sm">{project.reportingPeriod}</td>
                  <td className="p-3">
                    <StatusBadge value={project.projectStatus} type="status" />
                  </td>
                  <td className="p-3">
                    <StatusBadge value={project.riskLevel} type="risk" />
                  </td>
                  <td className="p-3">
                    <StatusBadge value={project.financialHealth} type="health" />
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No project reports found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
