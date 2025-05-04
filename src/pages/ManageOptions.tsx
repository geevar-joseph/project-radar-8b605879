
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Search, Edit, UserMinus, Filter, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { AddProjectModal } from "@/components/AddProjectModal";
import { AddTeamMemberModal } from "@/components/AddTeamMemberModal";

const ManageOptions = () => {
  const { 
    projectNames, 
    teamMembers, 
    removeProjectName, 
    removeTeamMember,
    projects
  } = useProjectContext();
  
  const [searchTeam, setSearchTeam] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Modal state
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);

  // Mock data for extended team member information
  const teamMembersData = teamMembers.map((name, index) => ({
    id: `U${1000 + index}`,
    name: name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    role: index % 3 === 0 ? "Admin" : index % 3 === 1 ? "Project Manager" : "Viewer",
    assignedProjects: Array.from(
      new Set(
        projects
          .filter(p => p.assignedPM === name)
          .map(p => p.projectName)
      )
    ),
  }));

  // Filtering and sorting for team members
  const filteredTeamMembers = teamMembersData
    .filter(member => 
      member.name.toLowerCase().includes(searchTeam.toLowerCase()) &&
      (roleFilter === "all" || member.role === roleFilter)
    )
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      
      switch(sortColumn) {
        case "id":
          return direction * a.id.localeCompare(b.id);
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "email":
          return direction * a.email.localeCompare(b.email);
        case "role":
          return direction * a.role.localeCompare(b.role);
        case "projects":
          return direction * (a.assignedProjects.length - b.assignedProjects.length);
        default:
          return 0;
      }
    });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get project information including all fields
  const projectsData = projects.filter(p => projectNames.includes(p.projectName));

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
              <div className="flex justify-between items-center">
                <CardTitle>Manage Projects</CardTitle>
                <Button onClick={() => setIsAddProjectModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned PM</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectNames.map(projectName => {
                      const projectData = projects.find(p => p.projectName === projectName);
                      return (
                        <TableRow key={projectName}>
                          <TableCell className="font-medium">{projectName}</TableCell>
                          <TableCell>{projectData?.clientName || "—"}</TableCell>
                          <TableCell>
                            {projectData?.projectType ? (
                              <Badge variant="outline">
                                {projectData.projectType}
                              </Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {projectData?.projectStatus ? (
                              <Badge variant="secondary">
                                {projectData.projectStatus}
                              </Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell>{projectData?.assignedPM || "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeProjectName(projectName)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Project Modal */}
          <AddProjectModal 
            open={isAddProjectModalOpen} 
            onOpenChange={setIsAddProjectModalOpen}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Team Members</CardTitle>
                <Button onClick={() => setIsAddTeamMemberModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team members..." 
                    className="pl-8"
                    value={searchTeam}
                    onChange={(e) => setSearchTeam(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="bg-background border rounded px-2 py-1 text-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("id")}
                      >
                        User ID {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("name")}
                      >
                        Full Name {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("email")}
                      >
                        Email Address {sortColumn === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("role")}
                      >
                        Role {sortColumn === "role" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("projects")}
                      >
                        Assigned Projects {sortColumn === "projects" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.id}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              member.role === "Admin" 
                                ? "default" 
                                : member.role === "Project Manager" 
                                  ? "secondary" 
                                  : "outline"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.assignedProjects.length > 0 ? (
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <Badge variant="outline" className="cursor-pointer">
                                  {member.assignedProjects.length} Project{member.assignedProjects.length !== 1 && 's'}
                                </Badge>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                {member.assignedProjects.map(project => (
                                  <ContextMenuItem key={project}>
                                    {project}
                                  </ContextMenuItem>
                                ))}
                              </ContextMenuContent>
                            </ContextMenu>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Edit User">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Remove User"
                              onClick={() => removeTeamMember(member.name)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Team Member Modal */}
          <AddTeamMemberModal 
            open={isAddTeamMemberModalOpen} 
            onOpenChange={setIsAddTeamMemberModalOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageOptions;
