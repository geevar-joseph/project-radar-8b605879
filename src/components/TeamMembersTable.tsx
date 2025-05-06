
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit } from "lucide-react";
import { EditTeamMemberModal } from "./EditTeamMemberModal";

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
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assigned Projects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{member.role}</Badge>
              </TableCell>
              <TableCell>
                {member.assignedProjects.length === 0 ? (
                  <span className="text-muted-foreground">No projects</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {member.assignedProjects.slice(0, 3).map((project) => (
                      <Badge key={project} variant="secondary">{project}</Badge>
                    ))}
                    {member.assignedProjects.length > 3 && (
                      <Badge variant="secondary">+{member.assignedProjects.length - 3}</Badge>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingMember(member)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeTeamMember(member.name)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Team Member Modal */}
      {editingMember && (
        <EditTeamMemberModal 
          open={!!editingMember}
          onOpenChange={() => setEditingMember(null)}
          teamMember={editingMember}
        />
      )}
    </div>
  );
};
