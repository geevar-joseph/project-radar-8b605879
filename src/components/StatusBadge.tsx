
import { RatingValue, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale, CustomerSatisfaction } from "@/types/project";
import { Badge } from "./ui/badge";
import { ScoreIndicator } from "./ScoreIndicator";

interface StatusBadgeProps {
  value: RatingValue | RiskLevel | FinancialHealth | CompletionStatus | TeamMorale | CustomerSatisfaction;
  type: "risk" | "health" | "completion" | "morale" | "satisfaction" | "rating";
  className?: string;
}

export function StatusBadge({ value, type, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`flex items-center gap-1 border-0 ${className || ''}`}>
      <ScoreIndicator value={value} type={type} />
    </Badge>
  );
}
