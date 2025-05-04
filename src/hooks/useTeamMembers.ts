
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchTeamMembers, addTeamMember as apiAddTeamMember, removeTeamMember as apiRemoveTeamMember } from "@/api/projectApi";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { names, error } = await fetchTeamMembers();
      
      if (error) throw error;
      
      setTeamMembers(names);
    } catch (error) {
      console.error('Error loading team members:', error);
      // Fallback to sample data handled by the API
    }
  };

  const addTeamMember = async (name: string, email: string, role: string) => {
    if (!teamMembers.includes(name)) {
      try {
        const { success, error } = await apiAddTeamMember(name, email, role);
        
        if (!success) throw error;
        
        setTeamMembers([...teamMembers, name]);
        
        toast({
          title: "Team Member Added",
          description: `"${name}" has been added to the team members list.`,
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
      
      if (!success) throw error;

      setTeamMembers(teamMembers.filter(member => member !== name));
      
      toast({
        title: "Team Member Removed",
        description: `"${name}" has been removed from the team members list.`,
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "There was an error removing the team member. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    teamMembers,
    addTeamMember,
    removeTeamMember,
    loadTeamMembers
  };
};
