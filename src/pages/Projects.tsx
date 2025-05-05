
import { useState, useMemo } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectReport, ProjectType, ProjectStatus } from "@/types/project";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProjectModal } from "@/components/AddProjectModal";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

const Projects = () => {
  const { projects } = useProjectContext();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectReport | null,
    direction: 'ascending' | 'descending'
  }>({
    key: null,
    direction: 'ascending'
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleSort = (key: keyof ProjectReport) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = [...filteredProjects].sort((a, b) => {
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

  // Pagination logic
  const pageCount = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIndicator = (key: keyof ProjectReport) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(date);
  };

  // Function to ensure project type is valid
  const getValidProjectType = (type: string | undefined): ProjectType | "N/A" => {
    if (type === "Service" || type === "Product") {
      return type;
    }
    return "N/A";
  };

  // Function to ensure project status is valid
  const getValidProjectStatus = (status: string | undefined): ProjectStatus | "N/A" => {
    if (status === "Active" || status === "Inactive" || status === "Support") {
      return status;
    }
    return "N/A";
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl"> {/* Increased max width */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all projects in one place
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>Add New Project</Button>
      </div>

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

      <div className="rounded-md border w-full overflow-x-auto">
        <Table>
          <TableCaption>A list of all projects (latest reports only)</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer">
                JIRA ID
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectName')}>
                Project Name {getSortIndicator('projectName')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('clientName')}>
                Client {getSortIndicator('clientName')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('assignedPM')}>
                Assigned PM {getSortIndicator('assignedPM')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectType')}>
                Type {getSortIndicator('projectType')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectStatus')}>
                Status {getSortIndicator('projectStatus')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('reportingPeriod')}>
                Last Report Date {getSortIndicator('reportingPeriod')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('overallProjectScore' as keyof ProjectReport)}>
                Overall Score {getSortIndicator('overallProjectScore' as keyof ProjectReport)}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('riskLevel')}>
                Risk Level {getSortIndicator('riskLevel')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('financialHealth')}>
                Financials {getSortIndicator('financialHealth')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project) => (
                <TableRow key={`${project.projectName}-${project.reportingPeriod}`} className="hover:bg-muted/50">
                  <TableCell>
                    {project.jiraId || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    <a href={`/project/${project.id}`} className="hover:underline text-primary">
                      {project.projectName}
                    </a>
                  </TableCell>
                  <TableCell>{project.clientName || "N/A"}</TableCell>
                  <TableCell>{project.assignedPM || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getValidProjectType(project.projectType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getValidProjectStatus(project.projectStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(project.submissionDate)}</TableCell>
                  <TableCell>
                    {project.overallProjectScore || "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={project.riskLevel} type="risk" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={project.financialHealth} type="health" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pageCount > 1 && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: pageCount }).map((_, i) => {
                const pageNumber = i + 1;
                // Display first page, last page, current page and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === pageCount || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) || 
                  (pageNumber === currentPage + 2 && currentPage < pageCount - 2)
                ) {
                  // Add ellipsis for skipped pages
                  return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <AddProjectModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
};

export default Projects;
