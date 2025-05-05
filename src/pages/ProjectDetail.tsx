
import { useParams, useNavigate } from "react-router-dom";
import { useProjectContext } from "@/context/ProjectContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ProjectKPIChart } from "@/components/ProjectKPIChart";
import { MonthlyReportsTable } from "@/components/MonthlyReportsTable";
import { useEffect, useState } from "react";
import { ProjectReport } from "@/types/project";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, projects } = useProjectContext();
  const navigate = useNavigate();
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  
  const project = getProject(id || "");

  useEffect(() => {
    if (project) {
      // Get all reports for the current project's name
      const allReportsForProject = projects.filter(p => 
        p.projectName === project.projectName
      );
      setProjectReports(allReportsForProject);
    }
  }, [project, projects]);
  
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
  
  const formattedDate = formatDate(project.submissionDate);
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
      
      {/* Compact Header Section */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.projectName}</h1>
              <StatusBadge value={project.riskLevel} type="risk" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex gap-1">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{project.clientName || 'N/A'}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="font-normal">{project.projectType || 'N/A'}</Badge>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="font-normal">{project.projectStatus || 'N/A'}</Badge>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">PM:</span>
                <span className="font-medium">{project.assignedPM || 'N/A'}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* KPI Chart Section */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Project KPI Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectKPIChart project={project} />
        </CardContent>
      </Card>
      
      {/* Monthly Reports Table Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monthly Reports History</h2>
        <MonthlyReportsTable reports={projectReports} />
      </div>
    </div>
  );
};

// Helper function for formatting date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export default ProjectDetail;
