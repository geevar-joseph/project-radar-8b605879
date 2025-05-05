
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

interface ProjectsTabProps {
  projectNames: string[];
  projects: ProjectReport[];
  removeProjectName: (name: string) => Promise<boolean>;
}

export const ProjectsTab = ({ projectNames, projects, removeProjectName }: ProjectsTabProps) => {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectsData, setProjectsData] = useState<any[]>([]);
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
        `);
      
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

  const handleRemoveProject = async (name: string) => {
    const success = await removeProjectName(name);
    if (success) {
      // Refresh data after successful deletion
      fetchProjectsData();
    }
  };

  // Define sort handlers for the table
  const handleSort = () => {}; // Empty function as placeholder
  const getSortIndicator = () => null; // Empty function as placeholder

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
          />
        )}
      </CardContent>

      {/* Project Modal */}
      <AddProjectModal 
        open={isAddProjectModalOpen} 
        onOpenChange={handleAddProject}
      />
    </Card>
  );
};
