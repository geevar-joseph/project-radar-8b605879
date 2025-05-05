
import { ProjectStatus, ProjectType } from "@/types/project";

/**
 * Format a date string to a readable format
 * Returns 'N/A' for invalid dates
 */
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
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
