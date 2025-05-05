
import { formatDate, getValidProjectStatus, getValidProjectType } from "@/utils/formatters";
import { ProjectReport, ProjectStatus, ProjectType } from "@/types/project";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";

interface ProjectsTableProps {
  projects: ProjectReport[];
  handleSort: (key: keyof ProjectReport) => void;
  getSortIndicator: (key: keyof ProjectReport) => string | null;
}

export function ProjectsTable({ projects, handleSort, getSortIndicator }: ProjectsTableProps) {
  return (
    <div className="rounded-md border w-full overflow-x-auto">
      <Table>
        <TableCaption>A list of all projects (latest reports only)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>JIRA ID</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('projectName')}>
              Project Name {getSortIndicator('projectName')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('clientName')}>
              Client {getSortIndicator('clientName')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('assignedPM')}>
              Assigned PM {getSortIndicator('assignedPM')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('projectType')}>
              Type {getSortIndicator('projectType')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('projectStatus')}>
              Status {getSortIndicator('projectStatus')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('reportingPeriod')}>
              Last Report Date {getSortIndicator('reportingPeriod')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('overallProjectScore')}>
              Overall Score {getSortIndicator('overallProjectScore')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('riskLevel')}>
              Risk Level {getSortIndicator('riskLevel')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('financialHealth')}>
              Financials {getSortIndicator('financialHealth')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <TableRow key={`${project.projectName}-${project.reportingPeriod}`} className="hover:bg-muted/50">
                <TableCell>{project.jiraId || "N/A"}</TableCell>
                <TableCell className="font-medium">
                  <a href={`/project/${project.id}`} className="hover:underline text-primary">
                    {project.projectName}
                  </a>
                </TableCell>
                <TableCell>{project.clientName || "N/A"}</TableCell>
                <TableCell>{project.assignedPM || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getValidProjectType(project.projectType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getValidProjectStatus(project.projectStatus)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(project.submissionDate) || "N/A"}</TableCell>
                <TableCell>
                  {project.overallProjectScore || "N/A"}
                </TableCell>
                <TableCell>
                  <StatusBadge value={project.riskLevel} type="risk" />
                </TableCell>
                <TableCell>
                  <StatusBadge value={project.financialHealth} type="health" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No projects found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
