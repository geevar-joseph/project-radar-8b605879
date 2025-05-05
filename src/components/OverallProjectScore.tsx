
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface OverallProjectScoreProps {
  score: number | null;
  doingWell: string[];
  needsAttention: string[];
}

export function OverallProjectScore({ score, doingWell, needsAttention }: OverallProjectScoreProps) {
  // Calculate the percentage for the progress bar
  const progressPercentage = score !== null ? (score / 4) * 100 : 0;

  // Determine color based on score
  const getScoreColor = () => {
    if (score === null) return "bg-gray-300";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-amber-400";
    if (score <= 3) return "bg-blue-400";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-4">
      {/* Row 1 - Overall Score Display */}
      <div className="flex items-center gap-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Overall Project Score</span>
            <span className="text-sm font-medium">
              {score !== null ? score.toFixed(2) : "0.00"} / 4
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2.5" 
            // Apply dynamic color class
            indicatorClassName={getScoreColor()}
          />
        </div>
      </div>

      <Separator />

      {/* Row 2 - Score Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Doing Well */}
        <div>
          <h4 className="text-sm font-medium mb-2">Doing Well</h4>
          {doingWell.length > 0 ? (
            <ul className="space-y-1">
              {doingWell.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No highlighted areas yet</p>
          )}
        </div>

        {/* Right Column - Pay Attention */}
        <div>
          <h4 className="text-sm font-medium mb-2">Pay Attention</h4>
          {needsAttention.length > 0 ? (
            <ul className="space-y-1">
              {needsAttention.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No issues found</p>
          )}
        </div>
      </div>
    </div>
  );
}
