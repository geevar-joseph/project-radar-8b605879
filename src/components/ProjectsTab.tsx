
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
import { createLatestProjectsDataMap, normalizeProjectData } from "@/utils/projectDataUtils";
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
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string>("client_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { loadProjects } = useProjectContext();
  const initialLoadDone = useRef(false);
  const loadingRef = useRef(false);
  const { toast } = useToast();
  
  // Initial data fetch only once when component mounts
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchProjectsData();
      initialLoadDone.current = true;
    }
  }, []);
  
  // Only refetch when modal closes (indicating a possible data change)
  useEffect(() => {
    if (!isAddProjectModalOpen && initialLoadDone.current) {
      // Wait a bit before fetching to avoid UI flashing
      setTimeout(() => {
        fetchProjectsData();
      }, 300);
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
        // Process data to ensure it has the right format for display
        const processedData = data.map(project => ({
          ...project,
          // Ensure team_members name is properly accessed
          assignedPM: project.team_members?.name || 'N/A'
        }));
        
        setProjectsData(processedData);
        console.log("Processed projects data:", processedData);
      }
    } catch (error) {
      console.error('Error fetching projects data:', error);
      // Use the projects from context as fallback
      if (projects && projects.length > 0) {
        setProjectsData(projects);
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
        if (loadProjects) {
          loadProjects().catch(error => {
            console.error("Error loading projects:", error);
          });
        }
      }, 300);
    }
  };

  const handleDeleteConfirm = (name: string) => {
    setProjectToDelete(name);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (projectToDelete) {
      const success = await removeProjectName(projectToDelete);
      if (success) {
        // Refresh data after successful deletion
        fetchProjectsData();
      }
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
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
