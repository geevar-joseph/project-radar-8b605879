
import { cn } from "@/lib/utils";

interface KPIScoreMeterProps {
  score: number | null;
  label: string;
  maxScore?: number;
}

export function KPIScoreMeter({ score, label, maxScore = 4 }: KPIScoreMeterProps) {
  // Calculate the number of pills to fill
  const filledPills = score !== null ? Math.round(score) : 0;
  
  // Determine color based on score for filled pills
  const getColor = (value: number) => {
    if (value <= 1) return "bg-red-500";
    if (value === 2) return "bg-orange-400";
    if (value === 3) return "bg-amber-400";
    return "bg-emerald-500";
  };

  // Generate the pill elements
  const pills = Array.from({ length: maxScore }, (_, i) => {
    const shouldFill = score !== null && i < filledPills;
    return (
      <div
        key={i}
        className={cn(
          "h-2 w-8 rounded-full mx-0.5 transition-colors",
          shouldFill ? getColor(filledPills) : "bg-transparent border border-gray-300"
        )}
        aria-hidden="true"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="flex items-center justify-center mb-1">
        {pills}
      </div>
      {score !== null ? (
        <div className={`text-xs ${getColor(filledPills).replace('bg-', 'text-')}`}>
          {score.toFixed(2)} / {maxScore}
        </div>
      ) : (
        <div className="text-xs text-gray-400">
          0.00 / {maxScore}
        </div>
      )}
    </div>
  );
}
