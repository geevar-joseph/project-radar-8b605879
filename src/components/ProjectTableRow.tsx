
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatDate, getValidProjectStatus, getValidProjectType } from "@/utils/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectType, ProjectStatus, RiskLevel, FinancialHealth } from "@/types/project";

interface ProjectData {
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
  jiraId?: string;
  overallScore?: string;
  riskLevel?: string;
  financialHealth?: string;
  id?: string;
  submissionDate?: string;
}

interface ProjectTableRowProps {
  project: ProjectData;
  onEdit: (projectName: string) => void;
  onRemove: (projectName: string) => void;
  isManageView?: boolean;
}

export const ProjectTableRow: React.FC<ProjectTableRowProps> = ({ 
  project, 
  onEdit, 
  onRemove,
  isManageView = false
}) => {
  return (
    <TableRow key={project.name}>
      <TableCell>{project.jiraId || "—"}</TableCell>
      <TableCell className="font-medium">
        {project.id ? (
          <a href={`/project/${project.id}`} className="hover:underline text-primary">
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </TableCell>
      <TableCell>{project.client || "—"}</TableCell>
      <TableCell>{project.pm || "—"}</TableCell>
      <TableCell>
        {project.type ? (
          <Badge variant="outline">{getValidProjectType(project.type as ProjectType)}</Badge>
        ) : "—"}
      </TableCell>
      <TableCell>
        {project.status ? (
          <Badge variant="secondary">{getValidProjectStatus(project.status as ProjectStatus)}</Badge>
        ) : "—"}
      </TableCell>
      {!isManageView && (
        <>
          <TableCell>{formatDate(project.submissionDate) || "—"}</TableCell>
          <TableCell>
            <StatusBadge value={project.overallScore || "0.0"} type="score" />
          </TableCell>
          <TableCell>
            <StatusBadge value={(project.riskLevel || 'N.A.') as RiskLevel} type="risk" />
          </TableCell>
          <TableCell>
            <StatusBadge value={(project.financialHealth || 'N.A.') as FinancialHealth} type="health" />
          </TableCell>
        </>
      )}
      {/* Only show action cell in manage view */}
      {isManageView && (
        <TableCell className="text-right space-x-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(project.name)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onRemove(project.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};
