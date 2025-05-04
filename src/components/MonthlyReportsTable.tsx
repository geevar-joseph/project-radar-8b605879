
import React from 'react';
import { ProjectReport } from '@/types/project';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MonthlyReportsTableProps {
  reports: ProjectReport[];
}

export const MonthlyReportsTable: React.FC<MonthlyReportsTableProps> = ({ reports }) => {
  const sortedReports = [...reports].sort((a, b) => {
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };

  const formatPeriod = (periodString: string) => {
    const [year, month] = periodString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[500px] w-full">
        <div className="w-[1200px] md:w-full">
          <Table>
            <TableCaption>Monthly Project Reports</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Reporting Period</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Financial Health</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Team Morale</TableHead>
                <TableHead>PM Evaluation</TableHead>
                <TableHead>Frontend</TableHead>
                <TableHead>Backend</TableHead>
                <TableHead>Testing</TableHead>
                <TableHead>Design</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell>{formatPeriod(report.reportingPeriod)}</TableCell>
                  <TableCell>{report.submittedBy}</TableCell>
                  <TableCell>{formatDate(report.submissionDate)}</TableCell>
                  <TableCell><StatusBadge value={report.overallProjectScore} type="rating" /></TableCell>
                  <TableCell><StatusBadge value={report.riskLevel} type="risk" /></TableCell>
                  <TableCell><StatusBadge value={report.financialHealth} type="health" /></TableCell>
                  <TableCell><StatusBadge value={report.completionOfPlannedWork} type="completion" /></TableCell>
                  <TableCell><StatusBadge value={report.teamMorale} type="morale" /></TableCell>
                  <TableCell><StatusBadge value={report.projectManagerEvaluation} type="rating" /></TableCell>
                  <TableCell><StatusBadge value={report.frontEndQuality} type="rating" /></TableCell>
                  <TableCell><StatusBadge value={report.backEndQuality} type="rating" /></TableCell>
                  <TableCell><StatusBadge value={report.testingQuality} type="rating" /></TableCell>
                  <TableCell><StatusBadge value={report.designQuality} type="rating" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};
