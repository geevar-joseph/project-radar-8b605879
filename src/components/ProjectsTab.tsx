
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ProjectReport } from "@/types/project";
import { ProjectsTable } from "./ProjectsTable";
import { AddProjectModal } from "./AddProjectModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContext } from "@/context/ProjectContext";

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
  
  useEffect(() => {
    fetchProjectsData();
  }, [projectNames, isAddProjectModalOpen]);
  
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = (open: boolean) => {
    setIsAddProjectModalOpen(open);
    // Refresh data when modal closes
    if (!open) {
      fetchProjectsData();
    }
  };

  const handleRemoveProject = async (name: string) => {
    const success = await removeProjectName(name);
    if (success) {
      // Refresh data after successful deletion
      fetchProjectsData();
    }
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
            projectNames={projectNames}
            projects={projectsData.length > 0 ? projectsData : projects}
            removeProjectName={handleRemoveProject}
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
