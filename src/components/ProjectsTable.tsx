
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { EditProjectModal } from "./EditProjectModal";
import { ProjectSearchBar } from "./ProjectSearchBar";
import { ProjectPagination } from "./ProjectPagination";
import { ProjectTableHeader } from "./ProjectTableHeader";
import { ProjectTableRow } from "./ProjectTableRow";
import { 
  createLatestProjectsDataMap, 
  normalizeProjectData 
} from "@/utils/projectDataUtils";

interface ProjectsTableProps {
  projectNames: string[];
  projects: any[];
  removeProjectName: (name: string) => void;
}

export const ProjectsTable = ({ projectNames, projects, removeProjectName }: ProjectsTableProps) => {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Group projects by name and get the latest data
  const latestProjectsData = useMemo(() => {
    return createLatestProjectsDataMap(projects);
  }, [projects]);

  // Filter project names based on search - restricted to project name and JIRA ID
  const filteredProjectNames = useMemo(() => {
    return projectNames.filter(name => {
      const projectData = normalizeProjectData(name, latestProjectsData);
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (projectData.jiraId && projectData.jiraId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [projectNames, searchTerm, latestProjectsData]);

  // Pagination logic
  const pageCount = Math.ceil(filteredProjectNames.length / itemsPerPage);
  const paginatedProjectNames = filteredProjectNames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search term change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset page when search changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Search Bar */}
      <ProjectSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />
      
      {/* Projects Table */}
      <div className="overflow-x-auto w-full">
        <Table>
          <ProjectTableHeader />
          <TableBody>
            {paginatedProjectNames.length > 0 ? (
              paginatedProjectNames.map(projectName => {
                const projectData = normalizeProjectData(projectName, latestProjectsData);
                
                return (
                  <ProjectTableRow
                    key={projectName}
                    project={projectData}
                    onEdit={setEditingProject}
                    onRemove={removeProjectName}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <ProjectPagination 
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal 
          open={!!editingProject}
          onOpenChange={() => setEditingProject(null)}
          projectName={editingProject}
        />
      )}
    </div>
  );
};
