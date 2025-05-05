
import { useState, useMemo } from "react";
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
  
  // Group projects by name and get the latest data
  const latestProjectsData = useMemo(() => {
    // Create a map to hold the latest data for each project
    const projectMap = new Map<string, any>();
    
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        // Get project name from different possible structures
        let projectName = '';
        
        if (project && typeof project === 'object') {
          if ('projectName' in project) {
            projectName = project.projectName;
          } else if ('project_name' in project) {
            projectName = project.project_name;
          }
        }
        
        if (!projectName) return;
        
        // If this project doesn't exist in our map yet, or if this entry is newer
        const existingProject = projectMap.get(projectName);
        
        if (!existingProject) {
          projectMap.set(projectName, project);
        } else {
          // Determine if this project is newer based on reporting_period or updated_at/submission_date
          let existingDate: Date | null = null;
          let currentDate: Date | null = null;
          
          if ('reporting_period' in existingProject && 'reporting_period' in project) {
            if (project.reporting_period > existingProject.reporting_period) {
              projectMap.set(projectName, project);
            }
          } else if ('updated_at' in existingProject && 'updated_at' in project) {
            existingDate = new Date(existingProject.updated_at);
            currentDate = new Date(project.updated_at);
            
            if (currentDate > existingDate) {
              projectMap.set(projectName, project);
            }
          } else if ('submission_date' in existingProject && 'submission_date' in project) {
            existingDate = new Date(existingProject.submission_date);
            currentDate = new Date(project.submission_date);
            
            if (currentDate > existingDate) {
              projectMap.set(projectName, project);
            }
          }
        }
      });
    }
    
    return projectMap;
  }, [projects]);
  
  // This function safely normalizes project data regardless of source
  const normalizeProjectData = (projectName: string): ProjectData => {
    // Check if we have a record for this project in our map
    const latestProjectData = Array.from(latestProjectsData.entries())
      .find(([name]) => name === projectName)?.[1];
    
    if (!latestProjectData) {
      return { name: projectName };
    }
    
    // Safely access properties using optional chaining
    return {
      name: projectName,
      client: 'clientName' in latestProjectData ? latestProjectData.clientName : 
             'client_name' in latestProjectData ? latestProjectData.client_name : 
             undefined,
      type: 'projectType' in latestProjectData ? latestProjectData.projectType : 
            'project_type' in latestProjectData ? latestProjectData.project_type : 
            undefined,
      status: 'projectStatus' in latestProjectData ? latestProjectData.projectStatus : 
              'project_status' in latestProjectData ? latestProjectData.project_status : 
              undefined,
      pm: 'assignedPM' in latestProjectData ? latestProjectData.assignedPM : 
          'assigned_pm' in latestProjectData ? latestProjectData.assigned_pm : 
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
