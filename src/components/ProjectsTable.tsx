
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
  handleSort: (key: string) => void;
  getSortIndicator: (key: string) => string | null;
  isManageView?: boolean; // New prop to determine which view we're in
}

export function ProjectsTable({ projects, handleSort, getSortIndicator, isManageView = false }: ProjectsTableProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  
  const handleEdit = (projectName: string) => {
    setEditingProject(projectName);
  };

  const handleCloseEditModal = () => {
    setEditingProject(null);
  };

  // Mapping function to handle different property naming conventions
  const getSortKey = (uiKey: string): string => {
    const keyMapping: Record<string, string> = {
      'projectName': 'project_name',
      'clientName': 'client_name',
      'assignedPM': 'assigned_pm',
      'projectType': 'project_type',
      'projectStatus': 'project_status',
      'reportingPeriod': 'reporting_period',
      'overallProjectScore': 'overall_project_score',
      'riskLevel': 'risk_level',
      'financialHealth': 'financial_health',
      'jiraId': 'jira_id'
    };
    return keyMapping[uiKey] || uiKey;
  };

  return (
    <div className="rounded-md border w-full overflow-x-auto">
      <Table>
        <TableCaption>A list of all projects (latest reports only)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('jiraId'))}>
              JIRA ID {getSortIndicator(getSortKey('jiraId'))}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('projectName'))}>
              Project Name {getSortIndicator(getSortKey('projectName'))}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('clientName'))}>
              Client {getSortIndicator(getSortKey('clientName'))}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('assignedPM'))}>
              Assigned PM {getSortIndicator(getSortKey('assignedPM'))}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('projectType'))}>
              Type {getSortIndicator(getSortKey('projectType'))}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('projectStatus'))}>
              Status {getSortIndicator(getSortKey('projectStatus'))}
            </TableHead>
            {!isManageView && (
              <>
                <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('reportingPeriod'))}>
                  Last Report Date {getSortIndicator(getSortKey('reportingPeriod'))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('overallProjectScore'))}>
                  Overall Score {getSortIndicator(getSortKey('overallProjectScore'))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('riskLevel'))}>
                  Risk Level {getSortIndicator(getSortKey('riskLevel'))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort(getSortKey('financialHealth'))}>
                  Financials {getSortIndicator(getSortKey('financialHealth'))}
                </TableHead>
              </>
            )}
            {/* Only show Actions column in manage view */}
            {isManageView && <TableHead>Actions</TableHead>}
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
                  isManageView={isManageView}
                />
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isManageView ? 7 : 11} className="h-24 text-center">
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
