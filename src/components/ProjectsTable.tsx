
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProjectReport } from "@/types/project";

// Define a unified project data structure that handles multiple sources
type ProjectData = {
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
}

interface ProjectsTableProps {
  projectNames: string[];
  projects: ProjectReport[] | any[];
  removeProjectName: (name: string) => void;
}

export const ProjectsTable = ({ projectNames, projects, removeProjectName }: ProjectsTableProps) => {
  // This function safely normalizes project data regardless of source
  const normalizeProjectData = (projectName: string): ProjectData => {
    const projectData = projects.find(p => {
      // Handle data from different sources (Supabase direct or frontend format)
      const pName = p.projectName || p.project_name;
      return pName === projectName;
    });
    
    if (!projectData) {
      return { name: projectName };
    }
    
    return {
      name: projectName,
      client: projectData.clientName || projectData.client_name || undefined,
      type: projectData.projectType || projectData.project_type || undefined,
      status: projectData.projectStatus || projectData.project_status || undefined,
      pm: projectData.assignedPM || projectData.assigned_pm || undefined
    };
  };

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
            const project = normalizeProjectData(projectName);
            
            return (
              <TableRow key={projectName}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client || "—"}</TableCell>
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
                <TableCell>{project.pm || "—"}</TableCell>
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
