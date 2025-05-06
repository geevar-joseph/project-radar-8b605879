
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

/**
 * Format period for chart display (MMM YY format)
 * @param periodString The period string in YYYY-MM format
 * @returns Formatted period string (MMM YY)
 */
export const formatPeriodForChart = (periodString: string): string => {
  if (!periodString || !/^\d{4}-\d{2}$/.test(periodString)) {
    return periodString || 'N/A';
  }
  
  try {
    const [year, month] = periodString.split('-');
    const numYear = parseInt(year, 10);
    const numMonth = parseInt(month, 10) - 1;
    
    // Validate year and month
    if (isNaN(numYear) || isNaN(numMonth) || numMonth < 0 || numMonth > 11) {
      return periodString;
    }
    
    const date = new Date(numYear, numMonth, 1);
    if (isNaN(date.getTime())) {
      return periodString;
    }
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      year: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting period for chart:', error, periodString);
    return periodString;
  }
};
