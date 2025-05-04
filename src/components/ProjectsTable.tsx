
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProjectReport } from "@/types/project";

interface ProjectsTableProps {
  projectNames: string[];
  projects: ProjectReport[];
  removeProjectName: (name: string) => void;
}

export const ProjectsTable = ({ projectNames, projects, removeProjectName }: ProjectsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned PM</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectNames.map(projectName => {
            const projectData = projects.find(p => p.projectName === projectName);
            return (
              <TableRow key={projectName}>
                <TableCell className="font-medium">{projectName}</TableCell>
                <TableCell>{projectData?.clientName || "—"}</TableCell>
                <TableCell>
                  {projectData?.projectType ? (
                    <Badge variant="outline">
                      {projectData.projectType}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {projectData?.projectStatus ? (
                    <Badge variant="secondary">
                      {projectData.projectStatus}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>{projectData?.assignedPM || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeProjectName(projectName)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
