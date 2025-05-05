
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

  // Comprehensive data loading on mount
  useEffect(() => {
    const initialLoad = async () => {
      if (loadProjects && !loadingInProgress.current && !initialLoadDone.current) {
        console.log("Initial loading of projects in ManageOptions");
        loadingInProgress.current = true;
        
        try {
          await loadProjects();
          console.log("Projects loaded successfully in ManageOptions");
          initialLoadDone.current = true;
        } catch (error) {
          console.error("Error loading projects data:", error);
          toast({
            title: "Failed to load data",
            description: "Could not retrieve project data. Please try refreshing.",
            variant: "destructive"
          });
        } finally {
          loadingInProgress.current = false;
        }
      }
    };
    
    initialLoad();
  }, [loadProjects, toast]);

  // Reload data when the component gains focus
  useEffect(() => {
    // Function to reload projects data
    const reloadData = async () => {
      if (!loadingInProgress.current && loadProjects) {
        loadingInProgress.current = true;
        try {
          await loadProjects();
          console.log("Projects reloaded on visibility change");
        } catch (error) {
          console.error("Error reloading data:", error);
        } finally {
          loadingInProgress.current = false;
        }
      }
    };
    
    // Add event listener for when window regains focus
    window.addEventListener('focus', reloadData);
    
    // Clean up
    return () => {
      window.removeEventListener('focus', reloadData);
    };
  }, [loadProjects]);

  // Ensure data is fresh when switching tabs
  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    // Reload data when switching tabs to ensure we have the latest
    if (!loadingInProgress.current) {
      loadingInProgress.current = true;
      try {
        await loadProjects();
        console.log("Projects reloaded after tab change");
      } catch (error) {
        console.error("Error reloading projects data:", error);
        toast({
          title: "Failed to reload data",
          description: "Could not retrieve updated project data.",
          variant: "destructive"
        });
      } finally {
        loadingInProgress.current = false;
      }
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
