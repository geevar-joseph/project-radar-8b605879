
import { cn } from "@/lib/utils";
import { RatingValue, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale, CustomerSatisfaction } from "@/types/project";

interface ScoreIndicatorProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale | CustomerSatisfaction | string;
  type?: "risk" | "health" | "completion" | "morale" | "satisfaction" | "rating" | "score";
  className?: string;
}

export function ScoreIndicator({ value, type, className }: ScoreIndicatorProps) {
  // Handle score type specifically for overall project score
  if (type === "score") {
    const scoreValue = parseFloat(value as string);
    if (isNaN(scoreValue)) {
      return (
        <div className={cn("flex items-center gap-1", className)}>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
          <span className="ml-2 text-sm text-gray-600">{value || "0.0"}</span>
        </div>
      );
    }
    
    // Determine color based on score
    let color = 'bg-gray-300';
    if (scoreValue >= 3.5) color = 'bg-emerald-500';
    else if (scoreValue >= 2.5) color = 'bg-blue-400';
    else if (scoreValue >= 1.5) color = 'bg-amber-400';
    else if (scoreValue > 0) color = 'bg-red-500';
    
    // Determine how many dots to fill based on score
    const activeCount = Math.round(scoreValue);
    const dots = Array.from({ length: 4 }, (_, i) => i < activeCount);
    
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
        <span className="ml-2 text-sm text-gray-600">{scoreValue.toFixed(1)}</span>
      </div>
    );
  }
  
  // First handle cases that depend on both the value AND the type
  if (type === "risk" && value === "High") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-2.5 h-2.5 rounded-full bg-orange-400" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-orange-400" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
        <span className="ml-2 text-sm text-gray-600">{value}</span>
      </div>
    );
  }
  
  if (type === "morale" && value === "Low") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-2.5 h-2.5 rounded-full bg-orange-400" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-orange-400" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
        <span className="ml-2 text-sm text-gray-600">{value}</span>
      </div>
    );
  }
  
  if (type === "risk" && value === "Low") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <span className="ml-2 text-sm text-gray-600">{value}</span>
      </div>
    );
  }
  
  if (type === "morale" && value === "High") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <span className="ml-2 text-sm text-gray-600">{value}</span>
      </div>
    );
  }
  
  // Now handle the general cases
  const getDotsConfig = () => {
    switch (value) {
      // Excellent ratings
      case 'Excellent':
      case 'Healthy':
      case 'All completed':
      case 'Very Satisfied':
        return {
          count: 4,
          activeCount: 4,
          color: 'bg-emerald-500'
        };
      
      // Good ratings
      case 'Good':
      case 'Mostly':
      case 'Moderate': // For team morale
      case 'Satisfied':
        return {
          count: 4,
          activeCount: 3,
          color: 'bg-blue-400'
        };
      
      // Fair ratings
      case 'Fair':
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-amber-400'
        };

      // Medium risk level (3 dots, yellow)
      case 'Medium': 
        return {
          count: 4,
          activeCount: 3,
          color: 'bg-amber-400'
        };
        
      // On Watch financial health (3 dots, yellow)
      case 'On Watch':
        return {
          count: 4,
          activeCount: 3,
          color: 'bg-amber-400'
        };

      // Partial completion
      case 'Partially':
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-amber-400'
        };

      // Neutral customer satisfaction
      case 'Neutral / Unclear':
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-amber-400'
        };
      
      // At Risk financial health
      case 'At Risk':
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-orange-400'
        };

      // Poor/Critical ratings
      case 'Poor':
      case 'Not completed':
      case 'Critical': // For risk level and financial health
      case 'Burnt Out': // For team morale
      case 'Dissatisfied':
        return {
          count: 4,
          activeCount: 1,
          color: 'bg-red-500'
        };
      
      // Default case
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
