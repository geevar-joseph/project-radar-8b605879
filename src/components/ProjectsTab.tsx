
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ProjectReport } from "@/types/project";
import { ProjectsTable } from "./ProjectsTable";
import { AddProjectModal } from "./AddProjectModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectsTabProps {
  projectNames: string[];
  projects: ProjectReport[];
  removeProjectName: (name: string) => void;
}

export const ProjectsTab = ({ projectNames, projects, removeProjectName }: ProjectsTabProps) => {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchProjectsData();
  }, [projectNames]);
  
  const fetchProjectsData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setProjectsData(data);
    } catch (error) {
      console.error('Error fetching projects data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Projects</CardTitle>
          <Button onClick={() => setIsAddProjectModalOpen(true)}>
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
            removeProjectName={removeProjectName}
          />
        )}
      </CardContent>

      {/* Project Modal */}
      <AddProjectModal 
        open={isAddProjectModalOpen} 
        onOpenChange={setIsAddProjectModalOpen}
      />
    </Card>
  );
};
