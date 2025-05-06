
/**
 * Formats a reporting period string for display (e.g., "2025-03" to "March 2025")
 */
export function formatPeriod(period: string): string {
  if (!period || period === "N/A") return "N/A";
  
  // Check if period is in YYYY-MM format
  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) return period; // Return original if not in expected format
  
  const [_, year, month] = match;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Convert to numeric month (1-12) and use to get month name
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return period; // Invalid month
  
  return `${monthNames[monthIndex]} ${year}`;
}

/**
 * Formats a reporting period for chart display (shorter version)
 */
export function formatPeriodForChart(period: string): string {
  if (!period || period === "N/A") return "N/A";
  
  // Check if period is in YYYY-MM format
  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) return period; // Return original if not in expected format
  
  const [_, year, month] = match;
  const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Convert to numeric month (1-12) and use to get month name
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return period; // Invalid month
  
  return `${shortMonthNames[monthIndex]} ${year.slice(2)}`;
}
