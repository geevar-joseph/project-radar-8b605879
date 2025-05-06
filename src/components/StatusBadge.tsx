
import { RatingValue, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale, CustomerSatisfaction } from "@/types/project";
import { Badge } from "./ui/badge";
import { ScoreIndicator } from "./ScoreIndicator";

interface StatusBadgeProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale | CustomerSatisfaction | string;
  type: "risk" | "health" | "completion" | "morale" | "satisfaction" | "rating" | "score" | "status";
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ value, type, className, showIcon = true }: StatusBadgeProps) {
  // For project status, render as a simple badge without dots
  if (type === "status") {
    let badgeVariant: "default" | "secondary" | "outline" = "secondary";
    return (
      <Badge variant={badgeVariant} className={`font-normal ${className || ''}`}>
        {value}
      </Badge>
    );
  }
  
  // For score type, only show the indicator which already includes the score value
  if (type === "score") {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 border-0 px-1 py-0.5 ${className || ''}`}>
        <ScoreIndicator value={value} type={type} />
      </Badge>
    );
  }
  
  // For risk, health, completion, morale, satisfaction, and rating types
  // Only show the icon with ScoreIndicator, as it already includes the text value
  return (
    <Badge variant="outline" className={`flex items-center gap-1 border-0 px-1 py-0.5 ${className || ''}`}>
      {showIcon && <ScoreIndicator value={value} type={type} />}
      {/* Do not display the value text separately as it's already in ScoreIndicator */}
    </Badge>
  );
}
