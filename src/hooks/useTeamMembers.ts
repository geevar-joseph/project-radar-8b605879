
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchTeamMembers, 
  addTeamMember as apiAddTeamMember, 
  removeTeamMember as apiRemoveTeamMember,
  updateTeamMember as apiUpdateTeamMember
} from "@/api/teamMembersApi";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  force_password_change?: boolean;
  auth_user_id?: string | null;
  assignedProjects?: string[]; // Added this property
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMemberNames, setTeamMemberNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      // Fetch directly from Supabase for latest data
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setTeamMembers(data);
        // Extract names from members array
        const names = data.map(member => member.name);
        setTeamMemberNames(names);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error Loading Team Members",
        description: "There was a problem loading the team members. Please try again.",
        variant: "destructive"
      });
      // Fallback to sample data handled by the API
      const { members } = await fetchTeamMembers();
      if (members) {
        setTeamMembers(members as TeamMember[]);
        const names = members.map((member: any) => member.name);
        setTeamMemberNames(names);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMember = async (name: string, email: string, role: string) => {
    if (!teamMemberNames.includes(name)) {
      try {
        const { success, error } = await apiAddTeamMember(name, email, role);
        
        if (!success) throw error;
        
        // Reload team members to get the latest data including auth IDs
        await loadTeamMembers();
        
        toast({
          title: "Team Member Added",
          description: `"${name}" has been added to the team members list. A welcome email has been sent.`,
        });
      } catch (error) {
        console.error('Error adding team member:', error);
        toast({
          title: "Error",
          description: "There was an error adding the team member. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
  };

  const removeTeamMember = async (name: string) => {
    try {
      const { success, error } = await apiRemoveTeamMember(name);
      
      if (!success) {
        if (error instanceof Error) {
          throw new Error(`Failed to remove team member: ${error.message}`);
        }
        throw error;
      }

      // Reload team members after successful removal
      await loadTeamMembers();
      
      toast({
        title: "Team Member Removed",
        description: `"${name}" has been removed from the team members list.`,
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "There was an error removing the team member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateTeamMember = async (originalName: string, name: string, email: string, role: string, assignedProjects?: string[]) => {
    try {
      const { success, error } = await apiUpdateTeamMember(originalName, name, email, role, assignedProjects);
      
      if (!success) throw error;

      // Reload team members data after update
      await loadTeamMembers();
      
      toast({
        title: "Team Member Updated",
        description: `"${name}" has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "There was an error updating the team member. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    teamMembers,
    teamMemberNames,
    isLoading,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    loadTeamMembers
  };
};
