
import { ProjectStatus, ProjectType } from "@/types/project";

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
};

/**
 * Ensure project type is valid
 */
export const getValidProjectType = (type: string | undefined): ProjectType | "N/A" => {
  if (type === "Service" || type === "Product") {
    return type;
  }
  return "N/A";
};

/**
 * Ensure project status is valid
 */
export const getValidProjectStatus = (status: string | undefined): ProjectStatus | "N/A" => {
  if (status === "Active" || status === "Inactive" || status === "Support") {
    return status;
  }
  return "N/A";
};
