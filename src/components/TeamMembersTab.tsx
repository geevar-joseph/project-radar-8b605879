
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TeamMembersTable } from "./TeamMembersTable";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import { ProjectReport } from "@/types/project";
import { useProjectContext } from "@/context/ProjectContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add a function to trigger refresh
  const refreshTeamMembers = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    fetchTeamMembersData();
  }, [teamMembers, projects, refreshTrigger]);
  
  const fetchTeamMembersData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Map the data to the expected format
      const mappedData = await Promise.all(data.map(async (member) => {
        // Get all projects assigned to this team member
        const { data: assignedProjects, error: projectsError } = await supabase
          .from('projects')
          .select('project_name')
          .eq('assigned_pm', member.id);
        
        if (projectsError) {
          console.error('Error fetching assigned projects:', projectsError);
        }
        
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          assignedProjects: assignedProjects ? assignedProjects.map(p => p.project_name) : [],
        };
      }));
      
      setTeamMembersData(mappedData);
    } catch (error) {
      console.error('Error fetching team members data:', error);
      
      // Fallback to creating mock data from the teamMembers prop
      const fallbackData = teamMembers.map((name, index) => ({
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
      
      setTeamMembersData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading ? (
          <div className="flex justify-center py-4">Loading team members...</div>
        ) : (
          <TeamMembersTable
            teamMembers={teamMembersData}
            removeTeamMember={removeTeamMember}
            refreshTeamMembers={refreshTeamMembers}
          />
        )}
      </CardContent>
      
      {/* Team Member Modal */}
      <AddTeamMemberModal 
        open={isAddTeamMemberModalOpen} 
        onOpenChange={setIsAddTeamMemberModalOpen}
      />
    </Card>
  );
};
