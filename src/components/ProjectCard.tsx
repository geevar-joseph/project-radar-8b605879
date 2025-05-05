
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProjectReport } from "@/types/project";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Type, Code } from "lucide-react";

interface ProjectCardProps {
  project: ProjectReport;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{project.projectName}</CardTitle>
          <StatusBadge value={project.riskLevel} type="risk" />
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-2 mt-1">
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3.5 w-3.5" />
            {project.id}
          </Badge>
          {project.clientName && (
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {project.clientName}
            </Badge>
          )}
          {project.projectType && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Type className="h-3.5 w-3.5" />
              {project.projectType}
            </Badge>
          )}
          {project.projectStatus && (
            <Badge variant="secondary">
              {project.projectStatus}
            </Badge>
          )}
          {project.assignedPM && (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {project.assignedPM}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Updated: {formatDate(project.submissionDate)}
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
