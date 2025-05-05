
import { useState, useEffect, useRef } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsTab } from "@/components/ProjectsTab";
import { TeamMembersTab } from "@/components/TeamMembersTab";

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

  // Load data only once when component mounts
  useEffect(() => {
    if (!initialLoadDone.current && loadProjects && !loadingInProgress.current) {
      loadingInProgress.current = true;
      loadProjects()
        .finally(() => {
          initialLoadDone.current = true;
          loadingInProgress.current = false;
        });
    }
  }, [loadProjects]);

  // Refresh data when switching tabs, but only if we haven't loaded already
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only reload if there was an error previously or we're switching tabs
    if (isError && !loadingInProgress.current) {
      loadingInProgress.current = true;
      loadProjects()
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
