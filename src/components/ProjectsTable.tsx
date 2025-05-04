
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProjectReport } from "@/types/project";

interface ProjectsTableProps {
  projectNames: string[];
  projects: ProjectReport[] | any[];
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
            // Check if we have a direct match from the Supabase projects data
            const projectData = projects.find(p => 
              p.project_name === projectName || p.projectName === projectName
            );
            
            return (
              <TableRow key={projectName}>
                <TableCell className="font-medium">{projectName}</TableCell>
                <TableCell>
                  {projectData?.client_name || projectData?.clientName || "—"}
                </TableCell>
                <TableCell>
                  {(projectData?.project_type || projectData?.projectType) ? (
                    <Badge variant="outline">
                      {projectData.project_type || projectData.projectType}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {(projectData?.project_status || projectData?.projectStatus) ? (
                    <Badge variant="secondary">
                      {projectData.project_status || projectData.projectStatus}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {projectData?.assigned_pm || projectData?.assignedPM || "—"}
                </TableCell>
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
