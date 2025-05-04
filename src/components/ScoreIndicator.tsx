
import { cn } from "@/lib/utils";
import { RatingValue, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale } from "@/types/project";

interface ScoreIndicatorProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale;
  className?: string;
}

export function ScoreIndicator({ value, className }: ScoreIndicatorProps) {
  const getDotsConfig = () => {
    switch (value) {
      case 'Excellent':
      case 'Healthy':
      case 'All completed':
      case 'High':
        return {
          count: 4,
          activeCount: 4,
          color: 'bg-status-excellent'
        };
      case 'Good':
      case 'On Watch':
      case 'Mostly':
      case 'Moderate':
      case 'Low': // For risk level, "Low" is positive
        return {
          count: 4,
          activeCount: 3,
          color: 'bg-status-good'
        };
      case 'Fair':
      case 'Partially':
      case 'Medium': // For risk level
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-status-fair'
        };
      case 'Poor':
      case 'At Risk':
      case 'Not completed':
      case 'High': // For risk level, "High" is negative
        return {
          count: 4,
          activeCount: 1,
          color: 'bg-status-poor'
        };
      case 'N.A.':
      default:
        return {
          count: 4,
          activeCount: 0,
          color: 'bg-gray-300'
        };
    }
  };

  const { count, activeCount, color } = getDotsConfig();
  const dots = Array.from({ length: count }, (_, i) => i < activeCount);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {dots.map((isActive, index) => (
        <div
          key={index}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all",
            isActive ? color : "bg-gray-200"
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">{value}</span>
    </div>
  );
}
