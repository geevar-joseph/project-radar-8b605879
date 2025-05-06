
// Re-export all the functions from the individual files
// This ensures backward compatibility with existing code

import { mapToProjectReport } from './mappers';
import { fetchProjectReports, fetchDashboardReports, addProjectReport, fetchAllReportingPeriods } from './projectReportsApi';
import { fetchProjects, addProjectName, removeProjectName, updateProjectDetails } from './projectsApi';
import { fetchTeamMembers, addTeamMember, removeTeamMember, updateTeamMember } from './teamMembersApi';

export {
  // Mappers
  mapToProjectReport,
  
  // Project Reports
  fetchProjectReports,
  fetchDashboardReports,
  addProjectReport,
  fetchAllReportingPeriods,
  
  // Projects
  fetchProjects,
  addProjectName,
  removeProjectName,
  updateProjectDetails,
  
  // Team Members
  fetchTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
};
