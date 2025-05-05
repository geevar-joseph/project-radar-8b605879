
import { useState, useMemo } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { ProjectsHeader } from "@/components/ProjectsHeader";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectsFiltering } from "@/components/ProjectsFiltering";
import { ProjectPagination } from "@/components/ProjectPagination";
import { ratingToValueMap, ProjectReport } from "@/types/project";

const Projects = () => {
  const { projects } = useProjectContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate overall project score for each project
  const projectsWithScores = useMemo(() => {
    return projects.map(project => {
      // Improved score calculation that's consistent with the detail page
      const calculateScore = (project: ProjectReport) => {
        try {
          // Check if there's already a valid score (checking both N/A formats)
          if (project.overallProjectScore && 
              project.overallProjectScore !== "N/A" && 
              project.overallProjectScore !== "N.A." &&
              !isNaN(Number(project.overallProjectScore))) {
            return project.overallProjectScore;
          }
          
          // Get all rating values
          const ratings = [
            project.projectManagerEvaluation ? ratingToValueMap[project.projectManagerEvaluation] : null,
            project.frontEndQuality ? ratingToValueMap[project.frontEndQuality] : null,
            project.backEndQuality ? ratingToValueMap[project.backEndQuality] : null,
            project.testingQuality ? ratingToValueMap[project.testingQuality] : null,
            project.designQuality ? ratingToValueMap[project.designQuality] : null
          ];
          
          // Filter out null values
          const validRatings = ratings.filter(r => r !== null && !isNaN(Number(r))) as number[];
          
          if (validRatings.length === 0) return "0.0";
          
          // Calculate average and format to one decimal place
          const average = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
          return average.toFixed(1);
        } catch (error) {
          console.error("Error calculating score for project:", project.projectName, error);
          return "0.0"; // Return a default value instead of N/A
        }
      };
      
      return {
        ...project,
        overallProjectScore: calculateScore(project)
      };
    });
  }, [projects]);

  const { 
    paginatedProjects, 
    pageCount,
    handleSort,
    getSortIndicator 
  } = ProjectsFiltering({
    projects: projectsWithScores,
    searchTerm,
    currentPage,
    itemsPerPage
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <ProjectsHeader 
        onAddProject={() => setAddModalOpen(true)} 
        showAddButton={false} // Hide Add Project button
      />
      
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
        isManageView={false} // Ensure we're not in manage view
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
