import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/formatters";
import { riskToColorMap, healthToColorMap, ratingToValueMap } from "@/types/project";
import { useNavigate } from "react-router-dom";

// Define the project data structure specifically for table rows
interface ProjectRowData {
  id?: string;
  name: string;
  client?: string;
  type?: string;
  status?: string;
  pm?: string;
  pmId?: string; // Add pmId to track the UUID of the PM
  jiraId?: string;
  overallScore?: string;
  riskLevel?: string;
  financialHealth?: string;
  submissionDate?: string;
  // Optional fields for score calculation
  completionOfPlannedWork?: string;
  teamMorale?: string;
  customerSatisfaction?: string;
  projectManagerEvaluation?: string;
  frontEndQuality?: string;
  backEndQuality?: string;
  testingQuality?: string;
  designQuality?: string;
}

interface ProjectTableRowProps {
  project: ProjectRowData;
  onEdit?: (projectName: string) => void;
  onRemove?: (projectName: string) => void;
  isManageView?: boolean;
  navigable?: boolean;
}

export const ProjectTableRow = ({ 
  project, 
  onEdit, 
  onRemove,
  isManageView = false,
  navigable = true
}: ProjectTableRowProps) => {
  const navigate = useNavigate();
  
  // Format and ensure all values have defaults for display
  const {
    id,
    name,
    client = "N/A",
    type = "Service",
    status = "Active",
    pm = "N/A",
    jiraId = "—",
    overallScore,
    riskLevel,
    financialHealth,
    submissionDate,
    // Additional fields for score calculation
    completionOfPlannedWork,
    teamMorale,
    customerSatisfaction,
    projectManagerEvaluation,
    frontEndQuality,
    backEndQuality,
    testingQuality,
    designQuality
  } = project;

  // Format date if available
  const formattedDate = submissionDate ? formatDate(submissionDate) : "—";

  // Calculate overall score if not provided or if it's "N.A."
  const calculateOverallScore = (): string => {
    // If a valid score is already provided, use it
    if (overallScore && !["N.A.", "N/A", "", "0.0", "0"].includes(overallScore)) {
      return overallScore;
    }
    
    // Otherwise calculate from individual scores
    const scores = [
      completionOfPlannedWork,
      teamMorale, 
      customerSatisfaction,
      projectManagerEvaluation,
      frontEndQuality,
      backEndQuality,
      testingQuality,
      designQuality
    ];
    
    // Filter out N.A. values and convert score strings to numbers
    const validScores = scores.filter(score => 
      score !== undefined && 
      !["N.A.", "N/A", null].includes(score as string)
    );
    
    if (validScores.length === 0) return "N/A";
    
    // Map string scores to numeric values
    const scoreMap: Record<string, number> = {
      "Excellent": 4,
      "Good": 3,
      "Fair": 2,
      "Poor": 1,
      "Low": 3,
      "Medium": 2,
      "High": 3,
      "Critical": 1,
      "At Risk": 1,
      "Needs Attention": 2,
      "On Track": 3,
      "Healthy": 4,
      "On Watch": 3,
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

  const displayScore = calculateOverallScore();

  const handleRowClick = () => {
    if (navigable && id) {
      navigate(`/project/${id}`);
    }
  };

  return (
    <TableRow 
      className={`${navigable && id ? 'hover:bg-muted/50 cursor-pointer' : 'hover:bg-muted/50'}`}
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">
        {jiraId || "—"}
      </TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{client}</TableCell>
      <TableCell>{pm}</TableCell>
      <TableCell>{type}</TableCell>
      <TableCell>
        <StatusBadge value={status || "Active"} type="rating" />
      </TableCell>
      
      {!isManageView && (
        <>
          <TableCell>{formattedDate}</TableCell>
          <TableCell>
            <StatusBadge value={displayScore} type="score" />
          </TableCell>
          <TableCell>
            {riskLevel ? (
              <span className={`inline-block w-3 h-3 rounded-full ${riskToColorMap[riskLevel] || "bg-gray-300"}`}></span>
            ) : "—"}
          </TableCell>
          <TableCell>
            {financialHealth ? (
              <span className={`inline-block w-3 h-3 rounded-full ${healthToColorMap[financialHealth] || "bg-gray-300"}`}></span>
            ) : "—"}
          </TableCell>
        </>
      )}
      
      {isManageView && onEdit && onRemove && (
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(name)}
              title="Edit Project"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onRemove(name)}
              title="Delete Project"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
