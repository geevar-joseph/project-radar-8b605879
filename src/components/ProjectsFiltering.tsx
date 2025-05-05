
import { useState, useMemo } from "react";
import { ProjectReport } from "@/types/project";

interface ProjectsFilteringProps {
  projects: ProjectReport[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
}

export function ProjectsFiltering({
  projects,
  searchTerm,
  currentPage,
  itemsPerPage
}: ProjectsFilteringProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectReport | null,
    direction: 'ascending' | 'descending'
  }>({
    key: null,
    direction: 'ascending'
  });

  // Group projects by project name and get the latest report for each project
  const latestProjectReports = useMemo(() => {
    const projectGroups: Record<string, ProjectReport[]> = {};
    
    // Group projects by projectName
    projects.forEach(project => {
      if (!projectGroups[project.projectName]) {
        projectGroups[project.projectName] = [];
      }
      projectGroups[project.projectName].push(project);
    });
    
    // For each group, get the latest report based on reporting period or submission date
    return Object.values(projectGroups).map(group => {
      return group.sort((a, b) => {
        // First try to compare by reporting period (assuming format YYYY-MM)
        if (a.reportingPeriod !== b.reportingPeriod) {
          return b.reportingPeriod.localeCompare(a.reportingPeriod);
        }
        // If reporting periods are the same, compare by submission date
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      })[0]; // Take the first one which is now the latest
    });
  }, [projects]);

  // Filter projects based on search term - restricted to project name and JIRA ID only
  const filteredProjects = useMemo(() => {
    return latestProjectReports.filter((project) => {
      return (
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.jiraId && project.jiraId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [latestProjectReports, searchTerm]);

  // Sort projects based on sort config
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProjects, sortConfig]);

  // Pagination logic
  const paginatedProjects = useMemo(() => {
    return sortedProjects.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedProjects, currentPage, itemsPerPage]);

  // Functions to handle sorting
  const handleSort = (key: keyof ProjectReport) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof ProjectReport) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return {
    paginatedProjects,
    pageCount: Math.ceil(sortedProjects.length / itemsPerPage),
    handleSort,
    getSortIndicator
  };
}
