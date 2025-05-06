
import { supabase } from "@/integrations/supabase/client";
import { generateSecurePassword } from "@/utils/password";

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
    // Generate a secure temporary password
    const tempPassword = generateSecurePassword();

    // Insert the team member with temporary password
    const { error } = await supabase
      .from('team_members')
      .insert({
        name,
        email,
        role,
        temp_password: tempPassword,
        force_password_change: true
      });

    if (error) throw error;

    // Send welcome email with login credentials
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { email, name, tempPassword }
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with success even if email fails
    }
    
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
    // Get the team member to get their auth_user_id
    const { data } = await supabase
      .from('team_members')
      .select('id, auth_user_id')
      .eq('name', name)
      .single();
    
    if (!data) {
      throw new Error('Team member not found');
    }

    // First, update all projects to remove this team member as assigned PM
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({ assigned_pm: null })
      .eq('assigned_pm', data.id);

    if (projectUpdateError) {
      console.error('Error removing project assignments:', projectUpdateError);
      throw projectUpdateError;
    }
    
    // Delete the team member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', data.id);

    if (deleteError) throw deleteError;

    // If there is an auth user associated, delete them from auth.users
    // Note: This will be handled by a cascade delete due to the foreign key relationship

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error };
  }
};

/**
 * Updates team member details in Supabase
 */
export const updateTeamMember = async (originalName: string, name: string, email: string, role: string, assignedProjects?: string[]) => {
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
    
    // If assignedProjects were provided, update project assignments
    if (assignedProjects && assignedProjects.length >= 0) {
      console.log(`Updating assigned projects for ${name}:`, assignedProjects);
      
      // First get all projects currently assigned to this team member
      const { data: currentProjects } = await supabase
        .from('projects')
        .select('id, project_name')
        .eq('assigned_pm', data.id);
      
      // For each currently assigned project that's no longer in assignedProjects,
      // remove the assignment
      if (currentProjects) {
        for (const project of currentProjects) {
          if (!assignedProjects.includes(project.project_name)) {
            console.log(`Removing ${name} from project ${project.project_name}`);
            const { error: unassignError } = await supabase
              .from('projects')
              .update({ assigned_pm: null })
              .eq('id', project.id);
            
            if (unassignError) {
              console.error(`Error unassigning project ${project.project_name}:`, unassignError);
            }
          }
        }
      }
      
      // For each project in assignedProjects, assign this team member as the PM
      for (const projectName of assignedProjects) {
        console.log(`Assigning ${name} to project ${projectName}`);
        const { error: assignError } = await supabase
          .from('projects')
          .update({ assigned_pm: data.id })
          .eq('project_name', projectName);
        
        if (assignError) {
          console.error(`Error assigning project ${projectName}:`, assignError);
        }
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating team member:', error);
    return { success: false, error };
  }
};
