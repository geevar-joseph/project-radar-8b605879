
import React from 'react';
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ComplianceTable = () => {
  const { projects, teamMembers } = useProjectContext();
  
  // Get the recent reporting periods (last 3 months)
  const recentPeriods = React.useMemo(() => {
    const periods = [...new Set(projects.map(p => p.reportingPeriod))];
    return periods.sort((a, b) => b.localeCompare(a)).slice(0, 3);
  }, [projects]);

  // Format period to readable text
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Calculate compliance status for each PM for each period
  const complianceData = React.useMemo(() => {
    return teamMembers.map(pm => {
      // Get all projects assigned to this PM
      const pmProjects = [...new Set(
        projects.filter(p => p.assignedPM === pm).map(p => p.projectName)
      )];
      
      // For each period, determine submission status
      const periodStatuses = recentPeriods.map(period => {
        // Check if PM has any projects in this period
        const projectsInPeriod = projects.filter(p => 
          p.reportingPeriod === period && 
          p.assignedPM === pm
        );
        
        if (projectsInPeriod.length === 0) {
          // If PM has no reports in this period, check if they had any projects assigned
          const hadAssignedProjects = pmProjects.length > 0;
          return {
            period,
            status: hadAssignedProjects ? 'Missing' : 'N/A',
          };
        }
        
        // Check submission timing (using simplified logic for demo)
        // In a real app, you would compare submission date to due date
        const lastDayOfMonth = new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]), 0).getDate();
        const isLate = projectsInPeriod.some(p => {
          const submissionDay = new Date(p.submissionDate).getDate();
          return submissionDay > lastDayOfMonth - 5; // Assume due 5 days before month end
        });
        
        return {
          period,
          status: isLate ? 'Late' : 'On Time',
        };
      });
      
      // Calculate compliance percentage
      const complianceScore = periodStatuses.reduce((score, status) => {
        if (status.status === 'On Time') return score + 1;
        if (status.status === 'Late') return score + 0.5;
        return score;
      }, 0) / periodStatuses.filter(s => s.status !== 'N/A').length * 100 || 0;
      
      return {
        pmName: pm,
        periodStatuses,
        complianceScore: Math.round(complianceScore)
      };
    });
  }, [projects, teamMembers, recentPeriods]);

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'On Time': return 'default';
      case 'Late': return 'secondary';
      case 'Missing': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Reporting Compliance by PM</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Manager</TableHead>
                {recentPeriods.map(period => (
                  <TableHead key={period}>{formatPeriod(period)}</TableHead>
                ))}
                <TableHead>Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map((pmData) => (
                <TableRow key={pmData.pmName}>
                  <TableCell className="font-medium">{pmData.pmName}</TableCell>
                  
                  {pmData.periodStatuses.map((status) => (
                    <TableCell key={status.period}>
                      <Badge variant={getBadgeVariant(status.status)}>
                        {status.status}
                      </Badge>
                    </TableCell>
                  ))}
                  
                  <TableCell>
                    <Badge 
                      variant={pmData.complianceScore >= 80 ? 'default' : 
                             pmData.complianceScore >= 50 ? 'secondary' : 'destructive'}
                    >
                      {pmData.complianceScore}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
