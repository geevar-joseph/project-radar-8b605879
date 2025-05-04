
import { useParams, useNavigate } from "react-router-dom";
import { useProjectContext } from "@/context/ProjectContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject } = useProjectContext();
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
  
  const dateParts = project.submissionDate.split('-');
  const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.projectName}</h1>
          <p className="text-muted-foreground">Submitted by {project.submittedBy} on {formattedDate}</p>
        </div>
        <StatusBadge value={project.overallProjectScore} type="rating" className="text-base px-4 py-2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
    </div>
  );
};

export default ProjectDetail;
