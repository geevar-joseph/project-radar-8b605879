import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all projects from Supabase
 */
export const fetchProjects = async () => {
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        team_members (
          id,
          name
        )
      `);

    if (projectsError) {
      throw projectsError;
    }
    
    return { projectsData, error: null };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projectsData: [], error };
  }
};

/**
 * Adds a project name to Supabase
 */
export const addProjectName = async (name: string, clientName?: string, jiraId?: string | null, projectType?: string, projectStatus?: string, assignedPM?: string | null) => {
  try {
    console.log("Adding project with jiraId:", jiraId);
    
    const { error } = await supabase
      .from('projects')
      .insert({
        project_name: name,
        client_name: clientName || null,
        jira_id: jiraId || null,  // Using the correct column name: jira_id
        project_type: projectType || 'Service',
        project_status: projectStatus || 'Active',
        assigned_pm: assignedPM || null
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding project name:', error);
    return { success: false, error };
  }
};

/**
 * Removes a project name from Supabase
 */
export const removeProjectName = async (name: string) => {
  try {
    // First check if there are any project reports
    const { data: reportData, error: reportError } = await supabase
      .from('project_reports')
      .select('project_id')
      .eq('projects.project_name', name)
      .limit(1);
    
    if (reportError) throw reportError;
    
    // If there are project reports linked to this project, we can't delete it
    if (reportData && reportData.length > 0) {
      return { 
        success: false, 
        error: new Error('Cannot delete project with linked reports. Delete the reports first.') 
      };
    }
    
    // Find the project by name
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('project_name', name)
      .single();
    
    if (data) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', data.id);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing project name:', error);
    return { success: false, error };
  }
};

/**
 * Updates project details in Supabase
 */
export const updateProjectDetails = async (originalName: string, updateData: {
  projectName: string;
  clientName?: string;
  jiraId?: string; // Added JIRA ID to updateData
  projectType?: string;
  projectStatus?: string;
  assignedPM?: string;
}) => {
  try {
    // Find the project by name
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('project_name', originalName)
      .single();
    
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Update the project
    const { error } = await supabase
      .from('projects')
      .update({
        project_name: updateData.projectName,
        client_name: updateData.clientName,
        jira_id: updateData.jiraId, // Include JIRA ID in the update
        project_type: updateData.projectType,
        project_status: updateData.projectStatus,
        assigned_pm: updateData.assignedPM,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProject.id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating project details:', error);
    return { success: false, error };
  }
};
