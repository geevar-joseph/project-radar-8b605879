
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";

interface ProjectData {
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
  jiraId?: string;
  overallScore?: string;
}

interface ProjectTableRowProps {
  project: ProjectData;
  onEdit: (projectName: string) => void;
  onRemove: (projectName: string) => void;
}

export const ProjectTableRow: React.FC<ProjectTableRowProps> = ({ 
  project, 
  onEdit, 
  onRemove 
}) => {
  return (
    <TableRow key={project.name}>
      <TableCell>{project.jiraId || "—"}</TableCell>
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{project.client || "—"}</TableCell>
      <TableCell>{project.pm || "—"}</TableCell>
      <TableCell>
        {project.type ? (
          <Badge variant="outline">{project.type}</Badge>
        ) : "—"}
      </TableCell>
      <TableCell>
        {project.status ? (
          <Badge variant="secondary">{project.status}</Badge>
        ) : "—"}
      </TableCell>
      <TableCell>{project.overallScore || "—"}</TableCell>
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
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
