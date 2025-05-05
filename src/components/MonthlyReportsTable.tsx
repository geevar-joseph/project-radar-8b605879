
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectReport, RiskLevel, FinancialHealth } from "@/types/project";
import { formatDate } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

interface MonthlyReportsTableProps {
  reports: ProjectReport[];
}

export function MonthlyReportsTable({ reports }: MonthlyReportsTableProps) {
  const navigate = useNavigate();
  
  // Format the reporting period for display
  const formatReportingPeriod = (period: string) => {
    if (!period) return "—";
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Handle clicking on a report row
  const handleReportClick = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  return (
    <Table>
      <TableCaption>Monthly project report submissions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Submitted By</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Financial</TableHead>
          <TableHead>Overall Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length > 0 ? (
          reports.map((report) => (
            <TableRow 
              key={report.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleReportClick(report.id)}
            >
              <TableCell className="font-medium">{formatReportingPeriod(report.reportingPeriod)}</TableCell>
              <TableCell>{report.submittedBy}</TableCell>
              <TableCell>{formatDate(report.submissionDate)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {report.projectStatus || "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusBadge value={(report.riskLevel || 'N.A.') as RiskLevel} type="risk" />
              </TableCell>
              <TableCell>
                <StatusBadge value={(report.financialHealth || 'N.A.') as FinancialHealth} type="health" />
              </TableCell>
              <TableCell>
                <StatusBadge value={report.overallProjectScore || "0.0"} type="score" />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
              No reports available for this project.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
