
import { cn } from "@/lib/utils";
import { RatingValue } from "@/types/project";

interface ScoreIndicatorProps {
  value: RatingValue;
  className?: string;
}

export function ScoreIndicator({ value, className }: ScoreIndicatorProps) {
  const getDotsConfig = () => {
    switch (value) {
      case 'Excellent':
        return {
          count: 4,
          activeCount: 4,
          color: 'bg-status-excellent'
        };
      case 'Good':
        return {
          count: 4,
          activeCount: 3,
          color: 'bg-status-good'
        };
      case 'Fair':
        return {
          count: 4,
          activeCount: 2,
          color: 'bg-status-fair'
        };
      case 'Poor':
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
