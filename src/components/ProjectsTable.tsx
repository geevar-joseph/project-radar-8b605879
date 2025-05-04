
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
            const projectData = projects.find(p => {
              // Handle both formats: database format and frontend type format
              const pName = p.projectName || p.project_name;
              return pName === projectName;
            });
            
            return (
              <TableRow key={projectName}>
                <TableCell className="font-medium">{projectName}</TableCell>
                <TableCell>
                  {projectData?.clientName || projectData?.client_name || "—"}
                </TableCell>
                <TableCell>
                  {(projectData?.projectType || projectData?.project_type) ? (
                    <Badge variant="outline">
                      {projectData?.projectType || projectData?.project_type}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {(projectData?.projectStatus || projectData?.project_status) ? (
                    <Badge variant="secondary">
                      {projectData?.projectStatus || projectData?.project_status}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {projectData?.assignedPM || projectData?.assigned_pm || "—"}
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
