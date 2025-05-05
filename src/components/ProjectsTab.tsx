
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
      fetchProjectsData();
    }
  }, [isAddProjectModalOpen]);
  
  const fetchProjectsData = async () => {
    setIsLoading(true);
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
        setProjectsData(data);
        // Also refresh the context data
        if (loadProjects) {
          await loadProjects();
        }
      }
    } catch (error) {
      console.error('Error fetching projects data:', error);
      toast({
        title: "Error fetching projects",
        description: "Could not load project data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = (open: boolean) => {
    setIsAddProjectModalOpen(open);
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
