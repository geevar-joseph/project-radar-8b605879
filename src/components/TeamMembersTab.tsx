
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TeamMembersTable } from "./TeamMembersTable";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import { ProjectReport } from "@/types/project";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedProjects: string[];
}

interface TeamMembersTabProps {
  teamMembers: string[];
  projects: ProjectReport[];
  removeTeamMember: (name: string) => void;
}

export const TeamMembersTab = ({ teamMembers, projects, removeTeamMember }: TeamMembersTabProps) => {
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);
  
  // Create extended team member information
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

  return (
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
        <TeamMembersTable
          teamMembers={teamMembersData}
          removeTeamMember={removeTeamMember}
        />
      </CardContent>
      
      {/* Team Member Modal */}
      <AddTeamMemberModal 
        open={isAddTeamMemberModalOpen} 
        onOpenChange={setIsAddTeamMemberModalOpen}
      />
    </Card>
  );
};
