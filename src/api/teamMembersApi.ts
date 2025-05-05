
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches team members from Supabase
 */
export const fetchTeamMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');

    if (error) {
      throw error;
    }

    return { members: data, error: null };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return { 
      members: [
        { 
          id: "sample-id-1", 
          name: "John Smith", 
          email: "john@example.com", 
          role: "Project Manager" 
        }
      ],
      error
    };
  }
};

/**
 * Adds a team member to Supabase
 */
export const addTeamMember = async (name: string, email: string, role: string) => {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert({
        name,
        email,
        role
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding team member:', error);
    return { success: false, error };
  }
};

/**
 * Removes a team member from Supabase
 */
export const removeTeamMember = async (name: string) => {
  try {
    const { data } = await supabase
      .from('team_members')
      .select('id')
      .eq('name', name)
      .single();
    
    if (data) {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', data.id);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error };
  }
};

/**
 * Updates team member details in Supabase
 */
export const updateTeamMember = async (originalName: string, name: string, email: string, role: string) => {
  try {
    // Find the team member by name
    const { data } = await supabase
      .from('team_members')
      .select('id')
      .eq('name', originalName)
      .single();
    
    if (!data) {
      throw new Error('Team member not found');
    }

    // Update the team member
    const { error } = await supabase
      .from('team_members')
      .update({
        name,
        email,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating team member:', error);
    return { success: false, error };
  }
};
