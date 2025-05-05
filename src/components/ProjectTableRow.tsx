
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/formatters";
import { riskToColorMap, healthToColorMap } from "@/types/project";
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
    overallScore = "—",
    riskLevel,
    financialHealth,
    submissionDate
  } = project;

  // Format date if available
  const formattedDate = submissionDate ? formatDate(submissionDate) : "—";

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
          <TableCell>{overallScore}</TableCell>
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
