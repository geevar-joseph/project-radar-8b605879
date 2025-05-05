
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { ProjectsHeader } from "@/components/ProjectsHeader";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectsFiltering } from "@/components/ProjectsFiltering";
import { ProjectPagination } from "@/components/ProjectPagination";

const Projects = () => {
  const { projects } = useProjectContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { 
    paginatedProjects, 
    pageCount,
    handleSort,
    getSortIndicator 
  } = ProjectsFiltering({
    projects,
    searchTerm,
    currentPage,
    itemsPerPage
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <ProjectsHeader onAddProject={() => setAddModalOpen(true)} />
      
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or JIRA ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page when search changes
            }}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <ProjectsTable 
        projects={paginatedProjects}
        handleSort={handleSort}
        getSortIndicator={getSortIndicator}
      />
      
      {pageCount > 1 && (
        <ProjectPagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      )}
      
      <AddProjectModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
};

export default Projects;
