
import { formatDate, getValidProjectStatus, getValidProjectType } from "@/utils/formatters";
import { ProjectReport, ProjectStatus, ProjectType } from "@/types/project";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectTableRow } from "./ProjectTableRow";
import { useState } from "react";
import { EditProjectModal } from "./EditProjectModal";

interface ProjectsTableProps {
  projects: ProjectReport[] | any[];
  handleSort: (key: keyof ProjectReport) => void;
  getSortIndicator: (key: keyof ProjectReport) => string | null;
}

export function ProjectsTable({ projects, handleSort, getSortIndicator }: ProjectsTableProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  
  const handleEdit = (projectName: string) => {
    setEditingProject(projectName);
  };

  const handleCloseEditModal = () => {
    setEditingProject(null);
  };

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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length > 0 ? (
            projects.map((project) => {
              const projectName = project.projectName || project.project_name;
              
              return (
                <ProjectTableRow 
                  key={`${project.id || projectName}`}
                  project={{
                    name: projectName,
                    client: project.clientName || project.client_name,
                    type: project.projectType || project.project_type,
                    status: project.projectStatus || project.project_status,
                    pm: project.assignedPM || (project.team_members && project.team_members.name),
                    jiraId: project.jiraId || project.jira_id,
                    overallScore: project.overallProjectScore || project.overall_project_score,
                    riskLevel: project.riskLevel,
                    financialHealth: project.financialHealth,
                    id: project.id,
                    submissionDate: project.submissionDate || project.updated_at
                  }}
                  onEdit={() => handleEdit(projectName)}
                  onRemove={() => console.log("Remove not implemented")}
                />
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                No projects found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {editingProject && (
        <EditProjectModal 
          open={!!editingProject} 
          onOpenChange={handleCloseEditModal}
          projectName={editingProject}
        />
      )}
    </div>
  );
}
