
import { Circle } from "lucide-react";

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

  // Calculate percentage for visual meter
  const percentage = (score / maxScore) * 100;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 3.5) return "text-emerald-500";
    if (score >= 2.5) return "text-green-500";
    if (score >= 1.5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="relative flex items-center">
        <Circle className={`h-12 w-12 ${getColor()}`} />
        <span className={`absolute inset-0 flex items-center justify-center font-bold ${getColor()}`}>
          {score.toFixed(2)}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">out of {maxScore}</div>
    </div>
  );
}
