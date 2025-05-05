
import React, { useMemo } from 'react';
import { ProjectReport, ratingToValueMap } from '@/types/project';
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

  // Calculate overall score for each report
  const reportsWithScores = useMemo(() => {
    return sortedReports.map(report => {
      // Return early if report already has a score
      if (report.overallProjectScore && report.overallProjectScore !== "N/A" && report.overallProjectScore !== "N.A.") {
        return report;
      }
      
      // Calculate score based on all KPIs
      try {
        // Get all rating values
        const ratings = [
          report.projectManagerEvaluation ? ratingToValueMap[report.projectManagerEvaluation] : null,
          report.frontEndQuality ? ratingToValueMap[report.frontEndQuality] : null,
          report.backEndQuality ? ratingToValueMap[report.backEndQuality] : null,
          report.testingQuality ? ratingToValueMap[report.testingQuality] : null,
          report.designQuality ? ratingToValueMap[report.designQuality] : null
        ];
        
        // Filter out null values
        const validRatings = ratings.filter(r => r !== null && !isNaN(Number(r))) as number[];
        
        if (validRatings.length === 0) {
          return {
            ...report,
            calculatedScore: "0.0"
          };
        }
        
        // Calculate average and format to one decimal place
        const average = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
        return {
          ...report,
          calculatedScore: average.toFixed(1)
        };
      } catch (error) {
        console.error("Error calculating score for report:", report.projectName, error);
        return {
          ...report,
          calculatedScore: "0.0"
        };
      }
    });
  }, [sortedReports]);

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
                <TableHead>Customer Satisfaction</TableHead>
                <TableHead>PM Evaluation</TableHead>
                <TableHead>Frontend</TableHead>
                <TableHead>Backend</TableHead>
                <TableHead>Testing</TableHead>
                <TableHead>Design</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsWithScores.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell>{formatPeriod(report.reportingPeriod)}</TableCell>
                  <TableCell>{report.submittedBy}</TableCell>
                  <TableCell>{formatDate(report.submissionDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{report.calculatedScore || report.overallProjectScore || "0.0"}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge value={report.riskLevel} type="risk" /></TableCell>
                  <TableCell><StatusBadge value={report.financialHealth} type="health" /></TableCell>
                  <TableCell><StatusBadge value={report.completionOfPlannedWork} type="completion" /></TableCell>
                  <TableCell><StatusBadge value={report.teamMorale} type="morale" /></TableCell>
                  <TableCell><StatusBadge value={report.customerSatisfaction} type="satisfaction" /></TableCell>
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
}
