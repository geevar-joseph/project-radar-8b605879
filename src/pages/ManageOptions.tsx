
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Search, Edit, UserMinus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

const ManageOptions = () => {
  const { 
    projectNames, 
    teamMembers, 
    addProjectName, 
    removeProjectName, 
    addTeamMember, 
    removeTeamMember,
    projects
  } = useProjectContext();
  
  const [newProject, setNewProject] = useState("");
  const [newTeamMember, setNewTeamMember] = useState("");
  const [searchTeam, setSearchTeam] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Manage Options</h1>
      
      <Tabs defaultValue="team" className="w-full">
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
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectNames.map(project => (
                      <TableRow key={project}>
                        <TableCell className="font-medium">{project}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeProjectName(project)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Input 
                  placeholder="Enter new team member name" 
                  value={newTeamMember} 
                  onChange={(e) => setNewTeamMember(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleAddTeamMember()}
                  className="flex-1"
                />
                <Button onClick={handleAddTeamMember}>Add</Button>
              </div>
              
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageOptions;
