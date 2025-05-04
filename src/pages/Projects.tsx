
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectReport } from "@/types/project";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Projects = () => {
  const { projects } = useProjectContext();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectReport | null,
    direction: 'ascending' | 'descending'
  }>({
    key: null,
    direction: 'ascending'
  });

  const handleSort = (key: keyof ProjectReport) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = [...projects].sort((a, b) => {
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

  const getSortIndicator = (key: keyof ProjectReport) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all projects in one place
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of all projects</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('id')}>
                ID {getSortIndicator('id')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectName')}>
                Project Name {getSortIndicator('projectName')}
              </TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned PM</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('submissionDate')}>
                Last Updated {getSortIndicator('submissionDate')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('overallProjectScore')}>
                Project Health {getSortIndicator('overallProjectScore')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('riskLevel')}>
                Risk Level {getSortIndicator('riskLevel')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('financialHealth')}>
                Budget Status {getSortIndicator('financialHealth')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{project.id}</TableCell>
                <TableCell className="font-medium">
                  <a href={`/project/${project.id}`} className="hover:underline text-primary">
                    {project.projectName}
                  </a>
                </TableCell>
                <TableCell>{project.submittedBy}</TableCell>
                <TableCell>
                  <Badge variant="outline">Development</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Ongoing</Badge>
                </TableCell>
                <TableCell>{project.submittedBy}</TableCell>
                <TableCell>{formatDate(project.submissionDate)}</TableCell>
                <TableCell>
                  <StatusBadge value={project.overallProjectScore} type="rating" />
                </TableCell>
                <TableCell>
                  <StatusBadge value={project.riskLevel} type="risk" />
                </TableCell>
                <TableCell>
                  <StatusBadge value={project.financialHealth} type="health" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Projects;
