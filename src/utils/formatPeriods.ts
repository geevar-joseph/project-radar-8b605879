
/**
 * Format a period string (YYYY-MM) into a more readable format (Month YYYY)
 * @param period The period string in YYYY-MM format
 * @returns Formatted period string (Month YYYY)
 */
export const formatPeriod = (period?: string): string => {
  if (!period) return "All Periods";
  
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1);
  
  return date.toLocaleString('default', { 
    month: 'short',
    year: 'numeric'
  });
};
