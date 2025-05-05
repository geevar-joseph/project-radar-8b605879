
/**
 * Format a period string (YYYY-MM) into a more readable format (Month YYYY)
 * @param period The period string in YYYY-MM format
 * @returns Formatted period string (Month YYYY)
 */
export const formatPeriod = (period?: string): string => {
  if (!period) return "All Periods";
  
  // Check if the period is in the expected format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return period; // Return the original string if it's not in YYYY-MM format
  }
  
  try {
    const [year, month] = period.split('-').map(Number);
    
    // Validate the month and year values
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return period; // Return the original string if values are invalid
    }
    
    const date = new Date(year, month - 1);
    
    return date.toLocaleString('default', { 
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting period:', error, period);
    return period; // Return the original string in case of errors
  }
};
