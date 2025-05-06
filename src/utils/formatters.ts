
import { format, isValid, parseISO } from 'date-fns';
import { ProjectStatus, ProjectType } from '@/types/project';

/**
 * Formats a date string to a more readable format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return 'N/A';
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Get valid project type value or return default
 */
export function getValidProjectType(type: ProjectType | undefined): ProjectType {
  if (typeof type === 'object' && type !== null) {
    return 'Service'; // Default if type is an object but invalid
  }
  
  if (type && (type === 'Service' || type === 'Product')) {
    return type;
  }
  
  return 'Service'; // Default
}

/**
 * Get valid project status value or return default
 */
export function getValidProjectStatus(status: ProjectStatus | undefined): ProjectStatus {
  if (typeof status === 'object' && status !== null) {
    return 'Active'; // Default if status is an object but invalid
  }
  
  if (status && (status === 'Active' || status === 'Completed' || status === 'On Hold' || status === 'Cancelled')) {
    return status;
  }
  
  return 'Active'; // Default
}
