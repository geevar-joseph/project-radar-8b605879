
import { useParams, useNavigate } from "react-router-dom";
import { useProjectContext } from "@/context/ProjectContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ProjectKPIChart } from "@/components/ProjectKPIChart";
import { MonthlyReportsTable } from "@/components/MonthlyReportsTable";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, projects } = useProjectContext();
  const navigate = useNavigate();
  
  const project = getProject(id || "");
  
  if (!project) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Get project reports for the same project name (in a real app, this would filter by project ID)
  const projectReports = projects.filter(p => p.projectName === project.projectName);
  
  const dateParts = project.submissionDate.split('-');
  const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
      
      {/* 1. Header Section */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.projectName}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p className="font-medium">{project.clientName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project Type</p>
                <Badge variant="outline" className="mt-1">{project.projectType || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project Status</p>
                <Badge variant="secondary" className="mt-1">{project.projectStatus || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned PM</p>
                <p className="font-medium">{project.assignedPM || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Health</p>
                <div className="mt-1">
                  <StatusBadge value={project.overallProjectScore} type="rating" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. KPI Chart Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project KPI Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectKPIChart project={project} />
        </CardContent>
      </Card>
      
      {/* 3. Project Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Risk Level</h3>
                <StatusBadge value={project.riskLevel} type="risk" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Financial Health</h3>
                <StatusBadge value={project.financialHealth} type="health" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Completion</h3>
                <StatusBadge value={project.completionOfPlannedWork} type="completion" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Team Morale</h3>
                <StatusBadge value={project.teamMorale} type="morale" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Team KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Project Manager Self-Evaluation</h3>
                <StatusBadge value={project.projectManagerEvaluation} type="rating" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Front-End Team Quality</h3>
                <StatusBadge value={project.frontEndQuality} type="rating" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Back-End Team Quality</h3>
                <StatusBadge value={project.backEndQuality} type="rating" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Testing Team Quality</h3>
                <StatusBadge value={project.testingQuality} type="rating" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Design Team Quality</h3>
                <StatusBadge value={project.designQuality} type="rating" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 4. Monthly Reports Table Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monthly Reports History</h2>
        <MonthlyReportsTable reports={projectReports} />
      </div>
    </div>
  );
};

export default ProjectDetail;
