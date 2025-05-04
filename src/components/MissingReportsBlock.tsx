
import React from 'react';
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MissingReportsBlockProps {
  selectedPeriod?: string;
}

export const MissingReportsBlock = ({ selectedPeriod }: MissingReportsBlockProps) => {
  const { projects, projectNames, teamMembers } = useProjectContext();
  
  // Find all project names that don't have a report for the selected period
  const missingProjects = React.useMemo(() => {
    if (!selectedPeriod) return [];
    
    // Get all project names with reports for this period
    const projectsWithReports = projects
      .filter(p => p.reportingPeriod === selectedPeriod)
      .map(p => p.projectName);
    
    // Filter out projects that already have reports
    return projectNames.filter(name => !projectsWithReports.includes(name))
      .map(name => {
        // Find most recent PM assignment for this project name (if any)
        const mostRecent = [...projects]
          .filter(p => p.projectName === name)
          .sort((a, b) => 
            new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
          )[0];
        
        return {
          projectName: name,
          assignedPM: mostRecent?.assignedPM || "Unassigned"
        };
      });
  }, [selectedPeriod, projects, projectNames]);

  // Parse period into readable format
  const formatPeriod = (period?: string) => {
    if (!period) return "All Periods";
    const [year, month] = period.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Projects with Missing Reports</CardTitle>
          {missingProjects.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {missingProjects.length} Missing
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {missingProjects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>All projects have submitted reports for {formatPeriod(selectedPeriod)}</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Project Manager</TableHead>
                  <TableHead>Reporting Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingProjects.map((project) => (
                  <TableRow key={project.projectName}>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.assignedPM}</TableCell>
                    <TableCell>{formatPeriod(selectedPeriod)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Missing</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
