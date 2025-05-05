
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectReport } from "@/types/project";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProjectModal } from "@/components/AddProjectModal";
import { FileText, User, Type, Code } from "lucide-react";

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all projects in one place
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>Add New Project</Button>
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('clientName')}>
                Client Name {getSortIndicator('clientName')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectType')}>
                Type {getSortIndicator('projectType')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('projectStatus')}>
                Status {getSortIndicator('projectStatus')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('assignedPM')}>
                Assigned PM {getSortIndicator('assignedPM')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('submissionDate')}>
                Last Updated {getSortIndicator('submissionDate')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('riskLevel')}>
                Project Health {getSortIndicator('riskLevel')}
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
                <TableCell>{project.clientName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Type className="h-3.5 w-3.5" />
                    {project.projectType || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {project.projectStatus || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> 
                  {project.assignedPM || "N/A"}
                </TableCell>
                <TableCell>{formatDate(project.submissionDate)}</TableCell>
                <TableCell>
                  <StatusBadge value={project.riskLevel} type="risk" />
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
      
      <AddProjectModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
};

export default Projects;
