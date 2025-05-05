
import { useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectReport, RiskLevel, FinancialHealth } from "@/types/project";
import { formatDate } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";
import { ProjectPagination } from "@/components/ProjectPagination";

interface MonthlyReportsTableProps {
  reports: ProjectReport[];
}

export function MonthlyReportsTable({ reports }: MonthlyReportsTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Format the reporting period for display
  const formatReportingPeriod = (period: string) => {
    if (!period) return "—";
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Convert reporting period string to date for sorting
  const periodToDate = (period: string): Date => {
    if (!period || period === "N/A") return new Date(0);
    const [year, month] = period.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  };
  
  // Handle clicking on a report row
  const handleReportClick = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  // Calculate overall score for display
  const calculateOverallScore = (report: ProjectReport): string => {
    // If the report already has an overall score that's not "N.A." or "N/A", use it
    if (report.overallProjectScore && 
       !["N.A.", "N/A", "", "0.0", "0"].includes(report.overallProjectScore)) {
      return report.overallProjectScore;
    }
    
    // Otherwise calculate from individual scores
    const scores = [
      report.completionOfPlannedWork,
      report.teamMorale, 
      report.customerSatisfaction,
      report.projectManagerEvaluation,
      report.frontEndQuality,
      report.backEndQuality,
      report.testingQuality,
      report.designQuality
    ];
    
    // Filter out N.A. values and convert score strings to numbers
    // Fixed TypeScript error by checking values against a string array instead of specific enum types
    const validScores = scores.filter(score => 
      score !== undefined && 
      !["N.A.", "N/A"].includes(score as string)
    );
    
    if (validScores.length === 0) return "N/A";
    
    // Map string scores to numeric values
    const scoreMap: Record<string, number> = {
      "Poor": 1,
      "Fair": 2,
      "Good": 3,
      "Excellent": 4,
      "Low": 3,
      "Medium": 2,
      "High": 3,
      "Critical": 1,
      "At Risk": 1,
      "Needs Attention": 2,
      "On Track": 3,
      "Healthy": 4,
      "None": 1,
      "Some": 2,
      "Mostly": 3,
      "All completed": 4,
      "Very Dissatisfied": 1,
      "Somewhat Dissatisfied": 2,
      "Neutral / Unclear": 2.5,
      "Satisfied": 3,
      "Very Satisfied": 4,
      "Burnt Out": 1,
      "Moderate": 2,
      "Partially": 2,
      "Not completed": 1,
      "Dissatisfied": 1
    };
    
    // Calculate the average score
    let totalScore = 0;
    let countedScores = 0;
    
    validScores.forEach(score => {
      if (score && typeof score === 'string' && scoreMap[score] !== undefined) {
        totalScore += scoreMap[score];
        countedScores++;
      }
    });
    
    if (countedScores === 0) return "N/A";
    
    const averageScore = (totalScore / countedScores).toFixed(1);
    return averageScore;
  };

  // Sort reports by reporting period (most recent first by default)
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = periodToDate(a.reportingPeriod);
    const dateB = periodToDate(b.reportingPeriod);
    return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
  });

  // Calculate pagination
  const pageCount = Math.ceil(sortedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedReports.length);
  const currentReports = sortedReports.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Table>
        <TableCaption>Monthly project report submissions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Period</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Overall Score</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Financial</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentReports.length > 0 ? (
            currentReports.map((report) => {
              const overallScore = calculateOverallScore(report);
              
              return (
                <TableRow 
                  key={report.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleReportClick(report.id)}
                >
                  <TableCell className="font-medium">{formatReportingPeriod(report.reportingPeriod)}</TableCell>
                  <TableCell>{report.submittedBy}</TableCell>
                  <TableCell>{formatDate(report.submissionDate)}</TableCell>
                  <TableCell>
                    <StatusBadge value={overallScore} type="score" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={(report.riskLevel || 'N/A') as RiskLevel} type="risk" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={(report.financialHealth || 'N/A') as FinancialHealth} type="health" />
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No reports available for this project.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {reports.length > itemsPerPage && (
        <ProjectPagination 
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
