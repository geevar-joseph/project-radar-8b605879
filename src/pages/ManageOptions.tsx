
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const ManageOptions = () => {
  const { 
    projectNames, 
    teamMembers, 
    addProjectName, 
    removeProjectName, 
    addTeamMember, 
    removeTeamMember 
  } = useProjectContext();
  
  const [newProject, setNewProject] = useState("");
  const [newTeamMember, setNewTeamMember] = useState("");

  const handleAddProject = () => {
    if (newProject.trim()) {
      addProjectName(newProject.trim());
      setNewProject("");
    }
  };

  const handleAddTeamMember = () => {
    if (newTeamMember.trim()) {
      addTeamMember(newTeamMember.trim());
      setNewTeamMember("");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Manage Options</h1>
      
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Manage Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input 
                  placeholder="Enter new project name" 
                  value={newProject} 
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                />
                <Button onClick={handleAddProject}>Add</Button>
              </div>
              
              <div className="space-y-2">
                {projectNames.map(project => (
                  <div key={project} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span>{project}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeProjectName(project)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Manage Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input 
                  placeholder="Enter new team member name" 
                  value={newTeamMember} 
                  onChange={(e) => setNewTeamMember(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleAddTeamMember()}
                />
                <Button onClick={handleAddTeamMember}>Add</Button>
              </div>
              
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div key={member} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span>{member}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeTeamMember(member)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageOptions;
