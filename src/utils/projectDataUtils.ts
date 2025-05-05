
/**
 * Utility functions for handling project data
 */

// Define a unified project data structure that handles multiple sources
export type ProjectData = {
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
  jiraId?: string;
  overallScore?: string;
};

/**
 * Extracts project name from different possible structures
 */
export function extractProjectName(project: any): string | null {
  if (!project || typeof project !== 'object') return null;
  
  if ('projectName' in project) {
    return project.projectName;
  } else if ('project_name' in project && project.project_name) {
    return String(project.project_name);
  } else if (project.projects && project.projects.project_name) {
    // Handle nested project structure
    return String(project.projects.project_name);
  }
  
  return null;
}

/**
 * Creates a map of latest project data by name
 */
export function createLatestProjectsDataMap(projects: any[]): Map<string, any> {
  // Create a map to hold the latest data for each project
  const projectMap = new Map<string, any>();
  
  if (!Array.isArray(projects)) return projectMap;
  
  projects.forEach(project => {
    // Get project name from different possible structures
    const projectName = extractProjectName(project);
    
    if (!projectName) return;
    
    // If this project doesn't exist in our map yet, or if this entry is newer
    const existingProject = projectMap.get(projectName);
    
    if (!existingProject) {
      projectMap.set(projectName, project);
    } else {
      // Determine if this project is newer based on reporting_period or updated_at/submission_date
      if ('reporting_period' in existingProject && 'reporting_period' in project) {
        if (project.reporting_period > existingProject.reporting_period) {
          projectMap.set(projectName, project);
        }
      } else if ('updated_at' in existingProject && 'updated_at' in project) {
        const existingDateValue = existingProject.updated_at;
        const currentDateValue = project.updated_at;
        
        if (existingDateValue && currentDateValue) {
          const existingDate = new Date(String(existingDateValue));
          const currentDate = new Date(String(currentDateValue));
          
          if (currentDate > existingDate) {
            projectMap.set(projectName, project);
          }
        }
      } else if ('submission_date' in existingProject && 'submission_date' in project) {
        const existingDateValue = existingProject.submission_date;
        const currentDateValue = project.submission_date;
        
        if (existingDateValue && currentDateValue) {
          const existingDate = new Date(String(existingDateValue));
          const currentDate = new Date(String(currentDateValue));
          
          if (currentDate > existingDate) {
            projectMap.set(projectName, project);
          }
        }
      }
    }
  });
  
  return projectMap;
}

/**
 * Normalizes project data regardless of source
 */
export function normalizeProjectData(projectName: string, latestProjectsData: Map<string, any>): ProjectData {
  // Check if we have a record for this project in our map
  const latestProjectData = latestProjectsData.get(projectName);
  
  if (!latestProjectData) {
    return { name: projectName };
  }
  
  // For PM, check if it's a team_members object with a name property
  let pmName;
  if (latestProjectData.team_members && typeof latestProjectData.team_members === 'object') {
    pmName = latestProjectData.team_members.name;
  } else if ('assignedPM' in latestProjectData) {
    pmName = latestProjectData.assignedPM;
  } else if ('assigned_pm' in latestProjectData) {
    pmName = latestProjectData.assigned_pm;
  } else if (latestProjectData.projects?.team_members) {
    // Handle nested team_members structure
    pmName = latestProjectData.projects.team_members.name;
  }
  
  // Safely access properties using optional chaining
  return {
    name: projectName,
    client: 'clientName' in latestProjectData ? latestProjectData.clientName : 
           'client_name' in latestProjectData ? latestProjectData.client_name : 
           latestProjectData.projects?.client_name || undefined,
    type: 'projectType' in latestProjectData ? latestProjectData.projectType : 
          'project_type' in latestProjectData ? latestProjectData.project_type : 
          latestProjectData.projects?.project_type || undefined,
    status: 'projectStatus' in latestProjectData ? latestProjectData.projectStatus : 
            'project_status' in latestProjectData ? latestProjectData.project_status : 
            latestProjectData.projects?.project_status || undefined,
    pm: pmName || undefined,
    jiraId: 'jiraId' in latestProjectData ? latestProjectData.jiraId : 
            'jira_id' in latestProjectData ? latestProjectData.jira_id : 
            latestProjectData.projects?.jira_id || undefined,
    overallScore: 'overallProjectScore' in latestProjectData ? latestProjectData.overallProjectScore : 
                  'overall_project_score' in latestProjectData ? latestProjectData.overall_project_score : 
                  latestProjectData.projects?.overall_project_score || undefined
  };
}
