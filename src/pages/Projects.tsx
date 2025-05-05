
import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectsHeader } from "@/components/ProjectsHeader";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectPagination } from "@/components/ProjectPagination";
import { ProjectSearchBar } from "@/components/ProjectSearchBar";
import { ProjectReport } from "@/types/project";
import { FilterDrawer } from "@/components/FilterDrawer";

const Projects = () => {
  // Initialize sorting by client name
  const [sortField, setSortField] = useState<keyof ProjectReport>("clientName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filteredProjects, setFilteredProjects] = useState<ProjectReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [filterCriteria, setFilterCriteria] = useState<{
    reportingPeriods: string[];
    projectTypes: string[];
    projectStatuses: string[];
    riskLevels: string[];
  }>({
    reportingPeriods: [],
    projectTypes: [],
    projectStatuses: [],
    riskLevels: []
  });

  const { projects, loadProjects } = useProjectContext();

  useEffect(() => {
    if (loadProjects) {
      loadProjects();
    }
  }, [loadProjects]);

  // Apply filtering
  useEffect(() => {
    let result = [...projects];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.projectName.toLowerCase().includes(term) || 
        (project.clientName && project.clientName.toLowerCase().includes(term)) ||
        (project.assignedPM && project.assignedPM.toLowerCase().includes(term))
      );
    }
    
    // Apply filter criteria
    if (filterCriteria.reportingPeriods.length > 0) {
      result = result.filter(project => filterCriteria.reportingPeriods.includes(project.reportingPeriod));
    }
    
    if (filterCriteria.projectTypes.length > 0) {
      result = result.filter(project => filterCriteria.projectTypes.includes(project.projectType));
    }
    
    if (filterCriteria.projectStatuses.length > 0) {
      result = result.filter(project => filterCriteria.projectStatuses.includes(project.projectStatus));
    }
    
    if (filterCriteria.riskLevels.length > 0) {
      result = result.filter(project => filterCriteria.riskLevels.includes(project.riskLevel));
    }
    
    // Apply sorting - default to client name
    result.sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // For numeric fields if we add them later
      return sortDirection === 'asc'
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA);
    });
    
    setFilteredProjects(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [projects, searchTerm, filterCriteria, sortField, sortDirection]);

  // Get current projects based on pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: any) => {
    setFilterCriteria(filters);
  };
  
  // Updated handleSort to correctly handle sorting
  const handleSort = (field: string) => {
    // Map the field names from the table to the actual field names in our data
    const fieldMapping: Record<string, keyof ProjectReport> = {
      'projectName': 'projectName',
      'clientName': 'clientName',
      'assignedPM': 'assignedPM',
      'projectType': 'projectType',
      'projectStatus': 'projectStatus',
      'reportingPeriod': 'reportingPeriod',
      'overallProjectScore': 'overallProjectScore',
      'riskLevel': 'riskLevel',
      'financialHealth': 'financialHealth',
      'jiraId': 'jiraId',
      // Add any other fields here
    };
    
    const mappedField = fieldMapping[field] || field as keyof ProjectReport;
    
    // If clicking the same field, toggle direction
    if (mappedField === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(mappedField);
      setSortDirection('asc');
    }

    console.log(`Sorting by ${mappedField} in ${sortDirection} order`);
  };
  
  const getSortIndicator = (field: string) => {
    // Map the field names from the table to the actual field names in our data
    const fieldMapping: Record<string, keyof ProjectReport> = {
      'projectName': 'projectName',
      'clientName': 'clientName',
      'assignedPM': 'assignedPM',
      'projectType': 'projectType',
      'projectStatus': 'projectStatus',
      'reportingPeriod': 'reportingPeriod',
      'overallProjectScore': 'overallProjectScore',
      'riskLevel': 'riskLevel',
      'financialHealth': 'financialHealth',
      'jiraId': 'jiraId',
      // Add any other fields here
    };
    
    const mappedField = fieldMapping[field] || field as keyof ProjectReport;
    
    if (mappedField !== sortField) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleAddProject = () => {
    console.log("Add new project functionality not implemented yet");
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <ProjectsHeader 
        onAddProject={handleAddProject}
        showAddButton={false}
      />
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <ProjectSearchBar 
          searchTerm={searchTerm} 
          onSearchChange={handleSearch} 
        />
        <FilterDrawer onChange={handleFilterChange} />
      </div>
      
      <ProjectsTable 
        projects={currentProjects} 
        handleSort={handleSort}
        getSortIndicator={getSortIndicator}
      />
      
      <ProjectPagination 
        currentPage={currentPage}
        pageCount={Math.ceil(filteredProjects.length / projectsPerPage)}
        onPageChange={paginate}
      />
    </div>
  );
};

export default Projects;
