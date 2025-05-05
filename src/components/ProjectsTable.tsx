import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Search } from "lucide-react";
import { ProjectReport } from "@/types/project";
import { EditProjectModal } from "./EditProjectModal";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from "@/components/ui/pagination";

// Define a unified project data structure that handles multiple sources
type ProjectData = {
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
  jiraId?: string;
  overallScore?: string;
}

interface ProjectsTableProps {
  projectNames: string[];
  projects: ProjectReport[] | any[];
  removeProjectName: (name: string) => void;
}

export const ProjectsTable = ({ projectNames, projects, removeProjectName }: ProjectsTableProps) => {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
          } else if ('project_name' in project && project.project_name) {
            projectName = String(project.project_name);
          } else if (project.projects && 'project_name' in project.projects) {
            // Handle nested project structure
            projectName = String(project.projects.project_name);
          } else {
            // Skip this project if we can't determine its name
            return;
          }
        }
        
        if (!projectName) return;
        
        // If this project doesn't exist in our map yet, or if this entry is newer
        const existingProject = projectMap.get(projectName);
        
        if (!existingProject) {
          projectMap.set(projectName, project);
        } else {
          // Determine if this project is newer based on reporting_period or updated_at/submission_date
          if ('reporting_period' in existingProject && 'reporting_period' in project) {
            if (project.reporting_period > existingProject.reporting_period) {
              projectMap.set(projectName, project);
            }
          } else if ('updated_at' in existingProject && 'updated_at' in project) {
            const existingDateValue = existingProject.updated_at;
            const currentDateValue = project.updated_at;
            
            if (existingDateValue && currentDateValue) {
              const existingDate = new Date(String(existingDateValue));
              const currentDate = new Date(String(currentDateValue));
              
              if (currentDate > existingDate) {
                projectMap.set(projectName, project);
              }
            }
          } else if ('submission_date' in existingProject && 'submission_date' in project) {
            const existingDateValue = existingProject.submission_date;
            const currentDateValue = project.submission_date;
            
            if (existingDateValue && currentDateValue) {
              const existingDate = new Date(String(existingDateValue));
              const currentDate = new Date(String(currentDateValue));
              
              if (currentDate > existingDate) {
                projectMap.set(projectName, project);
              }
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
    
    // For PM, check if it's a team_members object with a name property
    let pmName;
    if (latestProjectData.team_members && typeof latestProjectData.team_members === 'object') {
      pmName = latestProjectData.team_members.name;
    } else if ('assignedPM' in latestProjectData) {
      pmName = latestProjectData.assignedPM;
    } else if ('assigned_pm' in latestProjectData) {
      pmName = latestProjectData.assigned_pm;
    } else if (latestProjectData.projects?.team_members) {
      // Handle nested team_members structure
      pmName = latestProjectData.projects.team_members.name;
    }
    
    // Safely access properties using optional chaining
    return {
      name: projectName,
      client: 'clientName' in latestProjectData ? latestProjectData.clientName : 
             'client_name' in latestProjectData ? latestProjectData.client_name : 
             latestProjectData.projects?.client_name || undefined,
      type: 'projectType' in latestProjectData ? latestProjectData.projectType : 
            'project_type' in latestProjectData ? latestProjectData.project_type : 
            latestProjectData.projects?.project_type || undefined,
      status: 'projectStatus' in latestProjectData ? latestProjectData.projectStatus : 
              'project_status' in latestProjectData ? latestProjectData.project_status : 
              latestProjectData.projects?.project_status || undefined,
      pm: pmName || undefined,
      jiraId: 'jiraId' in latestProjectData ? latestProjectData.jiraId : 
              'jira_id' in latestProjectData ? latestProjectData.jira_id : 
              latestProjectData.projects?.jira_id || undefined,
      overallScore: 'overallProjectScore' in latestProjectData ? latestProjectData.overallProjectScore : 
                    'overall_project_score' in latestProjectData ? latestProjectData.overall_project_score : 
                    latestProjectData.projects?.overall_project_score || undefined
    };
  };

  // Filter project names based on search - restricted to only project name and JIRA ID
  const filteredProjectNames = useMemo(() => {
    return projectNames.filter(name => {
      const projectData = normalizeProjectData(name);
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (projectData.jiraId && projectData.jiraId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [projectNames, searchTerm, latestProjectsData]);

  // Pagination logic
  const pageCount = Math.ceil(filteredProjectNames.length / itemsPerPage);
  const paginatedProjectNames = filteredProjectNames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or JIRA ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page when search changes
            }}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>JIRA ID</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Assigned PM</TableHead>
              <TableHead>Project Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Overall Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjectNames.length > 0 ? (
              paginatedProjectNames.map(projectName => {
                const project = normalizeProjectData(projectName);
                
                return (
                  <TableRow key={projectName}>
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: pageCount }).map((_, i) => {
                const pageNumber = i + 1;
                // Display first page, last page, current page and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === pageCount || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) || 
                  (pageNumber === currentPage + 2 && currentPage < pageCount - 2)
                ) {
                  // Add ellipsis for skipped pages
                  return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
