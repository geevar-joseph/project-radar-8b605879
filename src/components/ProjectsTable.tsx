
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Edit } from "lucide-react";
import { ProjectReport } from "@/types/project";
import { EditProjectModal } from "./EditProjectModal";

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
  const [editingProject, setEditingProject] = useState<string | null>(null);
  
  // This function safely normalizes project data regardless of source
  const normalizeProjectData = (projectName: string): ProjectData => {
    const projectData = projects.find(p => {
      // Handle data from different sources (Supabase direct or frontend format)
      if (p && typeof p === 'object') {
        if ('projectName' in p) {
          return p.projectName === projectName;
        } else if ('project_name' in p) {
          return p.project_name === projectName;
        }
      }
      return false;
    });
    
    if (!projectData) {
      return { name: projectName };
    }
    
    // Safely access properties using hasOwnProperty or optional chaining
    return {
      name: projectName,
      client: 'clientName' in projectData ? projectData.clientName : 
             'client_name' in projectData ? projectData.client_name : 
             undefined,
      type: 'projectType' in projectData ? projectData.projectType : 
            'project_type' in projectData ? projectData.project_type : 
            undefined,
      status: 'projectStatus' in projectData ? projectData.projectStatus : 
              'project_status' in projectData ? projectData.project_status : 
              undefined,
      pm: 'assignedPM' in projectData ? projectData.assignedPM : 
          'assigned_pm' in projectData ? projectData.assigned_pm : 
          undefined
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
            <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right space-x-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingProject(projectName)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal 
          open={!!editingProject}
          onOpenChange={() => setEditingProject(null)}
          projectName={editingProject}
        />
      )}
    </div>
  );
};
