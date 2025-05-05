
import { cn } from "@/lib/utils";

interface KPIScoreMeterProps {
  score: number | null;
  label: string;
  maxScore?: number;
}

export function KPIScoreMeter({ score, label, maxScore = 4 }: KPIScoreMeterProps) {
  // Handle null or undefined score
  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium mb-1">{label}</div>
        <div className="text-gray-400 italic">No data available</div>
      </div>
    );
  }

  // Calculate the number of pills to fill
  const filledPills = Math.round(score);
  
  // Determine color based on score for filled pills
  const getColor = (value: number) => {
    if (value <= 1) return "bg-red-500";
    if (value <= 2) return "bg-amber-400";
    if (value <= 3) return "bg-blue-400";
    return "bg-emerald-500";
  };

  // Generate the pill elements
  const pills = Array.from({ length: maxScore }, (_, i) => {
    const shouldFill = i < filledPills;
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
      <div className={`text-xs ${getColor(filledPills).replace('bg-', 'text-')}`}>
        {score.toFixed(2)} / {maxScore}
      </div>
    </div>
  );
}
