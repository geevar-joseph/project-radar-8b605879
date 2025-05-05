
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ProjectReport } from "@/types/project";
import { ProjectsTable } from "./ProjectsTable";
import { AddProjectModal } from "./AddProjectModal";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProjectsTabProps {
  projectNames: string[];
  projects: ProjectReport[];
  removeProjectName: (name: string) => Promise<boolean>;
}

export const ProjectsTab = ({ projectNames, projects, removeProjectName }: ProjectsTabProps) => {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string>("client_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { loadProjects } = useProjectContext();
  const initialLoadDone = useRef(false);
  const loadingRef = useRef(false);
  const { toast } = useToast();
  
  // Initial data fetch when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      if (!initialLoadDone.current && !loadingRef.current) {
        loadingRef.current = true;
        try {
          await loadProjects();
          fetchProjectsData();
          initialLoadDone.current = true;
        } catch (error) {
          console.error("Failed to load initial project data:", error);
        } finally {
          loadingRef.current = false;
        }
      }
    };
    
    loadInitialData();
  }, [loadProjects]);
  
  // Reload data when returning to the page or when modal closes
  useEffect(() => {
    if (!isAddProjectModalOpen && initialLoadDone.current) {
      // Wait a bit before fetching to avoid UI flashing
      const timer = setTimeout(() => {
        fetchProjectsData();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAddProjectModalOpen]);
  
  const fetchProjectsData = async () => {
    // Prevent multiple simultaneous fetch operations
    if (loadingRef.current) {
      return;
    }
    
    setIsLoading(true);
    loadingRef.current = true;
    
    try {
      // Join with team_members table to get the PM's name instead of ID
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          team_members (
            id,
            name
          )
        `)
        .order(sortKey, { ascending: sortDirection === "asc" });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Ensure we have unique project names in the data
        const uniqueProjects = new Map<string, any>();
        
        data.forEach(project => {
          // Use project_name as the key for uniqueness
          uniqueProjects.set(project.project_name, {
            ...project,
            id: project.id,
            projectName: project.project_name,
            clientName: project.client_name || 'N/A',
            projectType: project.project_type || 'Service',
            projectStatus: project.project_status || 'Active',
            // Ensure team_members name is properly accessed - store both ID and name
            assignedPM: project.team_members?.name || 'N/A',
            assignedPMId: project.assigned_pm,
            jiraId: project.jira_id || undefined
          });
        });
        
        // Convert map back to array
        const processedData = Array.from(uniqueProjects.values());
        
        setProjectsData(processedData);
        console.log("Processed deduplicated projects data:", processedData.length);
      }
    } catch (error) {
      console.error('Error fetching projects data:', error);
      // Use the projects from context as fallback
      if (projects && projects.length > 0) {
        // Ensure we have unique project names in the data from context too
        const uniqueContextProjects = new Map<string, ProjectReport>();
        
        projects.forEach(project => {
          if (!uniqueContextProjects.has(project.projectName)) {
            uniqueContextProjects.set(project.projectName, project);
          }
        });
        
        const dedupedProjects = Array.from(uniqueContextProjects.values());
        setProjectsData(dedupedProjects);
      } else {
        toast({
          title: "Error fetching projects",
          description: "Could not load project data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const handleAddProject = (open: boolean) => {
    setIsAddProjectModalOpen(open);
    
    // If modal is being closed, refresh the data after a short delay
    if (!open && initialLoadDone.current) {
      setTimeout(() => {
        loadProjects().then(() => {
          fetchProjectsData();
        }).catch(error => {
          console.error("Error reloading projects:", error);
        });
      }, 300);
    }
  };

  const handleDeleteConfirm = (name: string) => {
    setProjectToDelete(name);
    setDeleteError(null); // Clear previous errors
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
  };

  const handleDeleteConfirmed = async () => {
    if (projectToDelete) {
      try {
        const success = await removeProjectName(projectToDelete);
        if (success) {
          // Force a complete data refresh
          await loadProjects();
          // Then refresh the local view
          fetchProjectsData();
          
          toast({
            title: "Project Deleted",
            description: `"${projectToDelete}" has been removed successfully.`
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete the project. It may have linked reports.",
            variant: "destructive"
          });
          setDeleteError("Failed to delete the project. It may have linked reports.");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to delete the project: ${errorMessage}`,
          variant: "destructive"
        });
        setDeleteError(`Failed to delete the project: ${errorMessage}`);
      } finally {
        setProjectToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // Define sort handlers for the table
  const handleSort = (key: string) => {
    // If clicking the same column, toggle sort direction
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, default to ascending sort
      setSortKey(key);
      setSortDirection("asc");
    }
    
    // Refetch with new sorting
    setTimeout(() => fetchProjectsData(), 0);
  };
  
  const getSortIndicator = (key: string) => {
    if (key !== sortKey) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Projects</CardTitle>
          <Button onClick={() => handleAddProject(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">Loading projects...</div>
        ) : (
          <ProjectsTable 
            projects={projectsData.length > 0 ? projectsData : projects}
            handleSort={handleSort}
            getSortIndicator={getSortIndicator}
            isManageView={true} // Set to true for Manage Options view
            onRemove={handleDeleteConfirm} // Pass the delete confirmation handler
          />
        )}
      </CardContent>

      {/* Project Modal */}
      <AddProjectModal 
        open={isAddProjectModalOpen} 
        onOpenChange={handleAddProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project 
              "{projectToDelete}" and remove it from our servers.
              {deleteError && (
                <div className="mt-2 text-red-500">{deleteError}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
