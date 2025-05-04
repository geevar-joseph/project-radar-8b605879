
import { cn } from "@/lib/utils";
import { 
  RatingValue, 
  RiskLevel, 
  FinancialHealth, 
  CompletionStatus,
  TeamMorale,
  ratingToColorMap,
  riskToColorMap,
  healthToColorMap,
  completionToColorMap,
  moraleToColorMap
} from "@/types/project";

interface StatusBadgeProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale;
  type: 'rating' | 'risk' | 'health' | 'completion' | 'morale';
  className?: string;
}

export function StatusBadge({ value, type, className }: StatusBadgeProps) {
  let colorClass = '';
  
  switch(type) {
    case 'rating':
      colorClass = ratingToColorMap[value as RatingValue];
      break;
    case 'risk':
      colorClass = riskToColorMap[value as RiskLevel];
      break;
    case 'health':
      colorClass = healthToColorMap[value as FinancialHealth];
      break;
    case 'completion':
      colorClass = completionToColorMap[value as CompletionStatus];
      break;
    case 'morale':
      colorClass = moraleToColorMap[value as TeamMorale];
      break;
  }
  
  return (
    <span className={cn(
      "px-2 py-1 rounded-md text-white text-xs font-medium inline-block",
      colorClass,
      className
    )}>
      {value}
    </span>
  );
}
