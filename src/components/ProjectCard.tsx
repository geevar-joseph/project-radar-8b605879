
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProjectReport } from "@/types/project";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: ProjectReport;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const dateParts = project.submissionDate.split('-');
  const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{project.projectName}</CardTitle>
          <StatusBadge value={project.overallProjectScore} type="rating" />
        </div>
        <div className="text-sm text-muted-foreground">
          Submitted by {project.submittedBy} on {formattedDate}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Risk Level</div>
            <StatusBadge value={project.riskLevel} type="risk" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Financial Health</div>
            <StatusBadge value={project.financialHealth} type="health" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Completion</div>
            <StatusBadge value={project.completionOfPlannedWork} type="completion" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Team Morale</div>
            <StatusBadge value={project.teamMorale} type="morale" />
          </div>
        </div>
        <Link to={`/project/${project.id}`} className="block w-full text-center py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
