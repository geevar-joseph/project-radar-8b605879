
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, UserMinus, Filter } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedProjects: string[];
}

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  removeTeamMember: (name: string) => void;
}

export const TeamMembersTable = ({ teamMembers, removeTeamMember }: TeamMembersTableProps) => {
  const [searchTeam, setSearchTeam] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredTeamMembers = teamMembers
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
    <>
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
    </>
  );
};
