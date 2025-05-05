
import { useState, useEffect, useRef } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsTab } from "@/components/ProjectsTab";
import { TeamMembersTab } from "@/components/TeamMembersTab";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const ManageOptions = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Manual refresh function
  const handleRefresh = async () => {
    if (!loadingInProgress.current && loadProjects) {
      setIsRefreshing(true);
      loadingInProgress.current = true;
      try {
        await loadProjects();
        toast({
          title: "Data refreshed",
          description: "The latest data has been loaded.",
        });
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast({
          title: "Refresh failed",
          description: "Failed to refresh data. Please try again.",
          variant: "destructive"
        });
      } finally {
        loadingInProgress.current = false;
        setIsRefreshing(false);
      }
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Options</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
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
