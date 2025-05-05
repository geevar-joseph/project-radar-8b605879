
import { useState, useEffect, useRef } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsTab } from "@/components/ProjectsTab";
import { TeamMembersTab } from "@/components/TeamMembersTab";
import { useToast } from "@/components/ui/use-toast";

const ManageOptions = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const { 
    projectNames, 
    teamMembers, 
    removeProjectName, 
    removeTeamMember,
    projects,
    loadProjects,
    isError
  } = useProjectContext();
  const initialLoadDone = useRef(false);
  const loadingInProgress = useRef(false);
  const { toast } = useToast();

  // Load data when component mounts and ensure we have fresh data
  useEffect(() => {
    if (loadProjects && !loadingInProgress.current) {
      loadingInProgress.current = true;
      
      loadProjects()
        .then(() => {
          console.log("Projects loaded successfully in ManageOptions");
          initialLoadDone.current = true;
        })
        .catch(error => {
          console.error("Error loading projects data:", error);
          toast({
            title: "Failed to load data",
            description: "Could not retrieve project data. Please try refreshing.",
            variant: "destructive"
          });
        })
        .finally(() => {
          loadingInProgress.current = false;
        });
    }
  }, [loadProjects, toast]);

  // Refresh data when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Reload data when switching tabs to ensure we have the latest
    if (!loadingInProgress.current) {
      loadingInProgress.current = true;
      loadProjects()
        .then(() => {
          console.log("Projects reloaded after tab change");
        })
        .catch(error => {
          console.error("Error reloading projects data:", error);
          toast({
            title: "Failed to reload data",
            description: "Could not retrieve updated project data.",
            variant: "destructive"
          });
        })
        .finally(() => {
          loadingInProgress.current = false;
        });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Manage Options</h1>
      
      <Tabs 
        defaultValue="projects" 
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          <ProjectsTab 
            projectNames={projectNames}
            projects={projects}
            removeProjectName={removeProjectName}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <TeamMembersTab
            teamMembers={teamMembers}
            projects={projects}
            removeTeamMember={removeTeamMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageOptions;
