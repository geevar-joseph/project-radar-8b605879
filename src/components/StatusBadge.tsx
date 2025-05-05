
import { RatingValue, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale, CustomerSatisfaction } from "@/types/project";
import { Badge } from "./ui/badge";
import { ScoreIndicator } from "./ScoreIndicator";

interface StatusBadgeProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale | CustomerSatisfaction | string;
  type: "risk" | "health" | "completion" | "morale" | "satisfaction" | "rating" | "score";
  className?: string;
}

export function StatusBadge({ value, type, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`flex items-center gap-1 border-0 px-1 py-0.5 ${className || ''}`}>
      <ScoreIndicator value={value} type={type} />
    </Badge>
  );
}
