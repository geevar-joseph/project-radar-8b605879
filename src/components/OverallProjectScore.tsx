
import { Separator } from "./ui/separator";

interface OverallProjectScoreProps {
  score: number | null;
  doingWell: string[];
  needsAttention: string[];
}

export function OverallProjectScore({ score, doingWell, needsAttention }: OverallProjectScoreProps) {
  return (
    <div className="space-y-4">
      {/* Score Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
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

        {/* Vertical Divider - only visible on md screens and above */}
        <Separator orientation="vertical" className="absolute h-full left-1/2 -translate-x-1/2 hidden md:block" />

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
