
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { KPIScoreMeter } from "@/components/KPIScoreMeter";
import { ScoreIndicator } from "@/components/ScoreIndicator";
import { OverallProjectScore } from "@/components/OverallProjectScore";
import { 
  ratingToValueMap,
  riskToValueMap, 
  financialToValueMap, 
  completionToValueMap, 
  moraleToValueMap, 
  satisfactionToValueMap
} from "@/types/project";

const MonthlyReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjectContext();
  
  // Find the specific report based on the ID
  const report = projects.find(p => p.id === reportId);
  
  // If report is not found, show a message
  if (!report) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  // Calculate scores for each section
  const [projectHealthScore, setProjectHealthScore] = useState<number | null>(null);
  const [teamKPIsScore, setTeamKPIsScore] = useState<number | null>(null);
  const [departmentalScore, setDepartmentalScore] = useState<number | null>(null);
  const [overallProjectScore, setOverallProjectScore] = useState<number | null>(null);
  const [doingWellKPIs, setDoingWellKPIs] = useState<string[]>([]);
  const [needsAttentionKPIs, setNeedsAttentionKPIs] = useState<string[]>([]);
  
  // Calculate all scores on component mount
  useEffect(() => {
    // Calculate Project Health Score
    const riskScore = riskToValueMap[report.riskLevel];
    const financialScore = financialToValueMap[report.financialHealth];
    const satisfactionScore = satisfactionToValueMap[report.customerSatisfaction];
    
    const healthScores = [riskScore, financialScore, satisfactionScore].filter(score => score !== null) as number[];
    const healthAverage = healthScores.length > 0 
      ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length 
      : null;
    
    setProjectHealthScore(healthAverage);
    
    // Calculate Team KPIs Score
    const moraleScore = moraleToValueMap[report.teamMorale];
    const completionScore = completionToValueMap[report.completionOfPlannedWork];
    
    const teamScores = [moraleScore, completionScore].filter(score => score !== null) as number[];
    const teamAverage = teamScores.length > 0 
      ? teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length 
      : null;
    
    setTeamKPIsScore(teamAverage);
    
    // Calculate Departmental Performance Score
    const pmScore = ratingToValueMap[report.projectManagerEvaluation];
    const frontEndScore = ratingToValueMap[report.frontEndQuality];
    const backEndScore = ratingToValueMap[report.backEndQuality];
    const testingScore = ratingToValueMap[report.testingQuality];
    const designScore = ratingToValueMap[report.designQuality];
    
    const deptScores = [pmScore, frontEndScore, backEndScore, testingScore, designScore]
      .filter(score => score !== null) as number[];
    const deptAverage = deptScores.length > 0 
      ? deptScores.reduce((sum, score) => sum + score, 0) / deptScores.length 
      : null;
    
    setDepartmentalScore(deptAverage);
    
    // Calculate Overall Project Score
    const allScores = [healthAverage, teamAverage, deptAverage].filter(score => score !== null) as number[];
    const overallAverage = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : null;
    
    setOverallProjectScore(overallAverage);
    
    // Identify strengths and weaknesses
    const doingWell: string[] = [];
    const needsAttention: string[] = [];
    
    // Check risk level
    if (riskToValueMap[report.riskLevel] !== null) {
      if (riskToValueMap[report.riskLevel] >= 3) {
        doingWell.push('Risk Management');
      } else if (riskToValueMap[report.riskLevel] !== null && riskToValueMap[report.riskLevel] <= 2) {
        needsAttention.push('Risk Management');
      }
    }
    
    // Check financial health
    if (financialToValueMap[report.financialHealth] !== null) {
      if (financialToValueMap[report.financialHealth] >= 3) {
        doingWell.push('Financial Health');
      } else if (financialToValueMap[report.financialHealth] !== null && financialToValueMap[report.financialHealth] <= 2) {
        needsAttention.push('Financial Health');
      }
    }
    
    // Check customer satisfaction
    if (satisfactionToValueMap[report.customerSatisfaction] !== null) {
      if (satisfactionToValueMap[report.customerSatisfaction] >= 3) {
        doingWell.push('Customer Satisfaction');
      } else if (satisfactionToValueMap[report.customerSatisfaction] !== null && satisfactionToValueMap[report.customerSatisfaction] <= 2) {
        needsAttention.push('Customer Satisfaction');
      }
    }
    
    // Check team morale
    if (moraleToValueMap[report.teamMorale] !== null) {
      if (moraleToValueMap[report.teamMorale] >= 3) {
        doingWell.push('Team Morale');
      } else if (moraleToValueMap[report.teamMorale] !== null && moraleToValueMap[report.teamMorale] <= 2) {
        needsAttention.push('Team Morale');
      }
    }
    
    // Check completion status
    if (completionToValueMap[report.completionOfPlannedWork] !== null) {
      if (completionToValueMap[report.completionOfPlannedWork] >= 3) {
        doingWell.push('Work Completion');
      } else if (completionToValueMap[report.completionOfPlannedWork] !== null && completionToValueMap[report.completionOfPlannedWork] <= 2) {
        needsAttention.push('Work Completion');
      }
    }
    
    // Check departmental quality scores
    if (ratingToValueMap[report.projectManagerEvaluation] !== null) {
      if (ratingToValueMap[report.projectManagerEvaluation] >= 3) {
        doingWell.push('Project Management');
      } else if (ratingToValueMap[report.projectManagerEvaluation] !== null && ratingToValueMap[report.projectManagerEvaluation] <= 2) {
        needsAttention.push('Project Management');
      }
    }
    
    if (ratingToValueMap[report.frontEndQuality] !== null) {
      if (ratingToValueMap[report.frontEndQuality] >= 3) {
        doingWell.push('Front-End Quality');
      } else if (ratingToValueMap[report.frontEndQuality] !== null && ratingToValueMap[report.frontEndQuality] <= 2) {
        needsAttention.push('Front-End Quality');
      }
    }
    
    if (ratingToValueMap[report.backEndQuality] !== null) {
      if (ratingToValueMap[report.backEndQuality] >= 3) {
        doingWell.push('Back-End Quality');
      } else if (ratingToValueMap[report.backEndQuality] !== null && ratingToValueMap[report.backEndQuality] <= 2) {
        needsAttention.push('Back-End Quality');
      }
    }
    
    if (ratingToValueMap[report.testingQuality] !== null) {
      if (ratingToValueMap[report.testingQuality] >= 3) {
        doingWell.push('Testing Quality');
      } else if (ratingToValueMap[report.testingQuality] !== null && ratingToValueMap[report.testingQuality] <= 2) {
        needsAttention.push('Testing Quality');
      }
    }
    
    if (ratingToValueMap[report.designQuality] !== null) {
      if (ratingToValueMap[report.designQuality] >= 3) {
        doingWell.push('Design Quality');
      } else if (ratingToValueMap[report.designQuality] !== null && ratingToValueMap[report.designQuality] <= 2) {
        needsAttention.push('Design Quality');
      }
    }
    
    setDoingWellKPIs(doingWell);
    setNeedsAttentionKPIs(needsAttention);
  }, [report]);

  // Format reporting period for display
  const formatReportingPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Format submission date
  const formatSubmissionDate = (date: string) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Create read-only field display component
  const ReadOnlyField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="space-y-1 mb-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-base font-medium">{value || "—"}</div>
    </div>
  );

  // Create rating display component with color indicators
  const RatingDisplay = ({ 
    value, 
    type 
  }: { 
    value: string; 
    type: "risk" | "health" | "completion" | "morale" | "satisfaction" | "rating" | "score"
  }) => (
    <div className="flex items-center">
      <ScoreIndicator value={value} type={type} />
      <span className="ml-2">{value}</span>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Monthly Report Details</h1>
        <p className="text-muted-foreground mt-2">
          Viewing report for {report.projectName} - {formatReportingPeriod(report.reportingPeriod)}
        </p>
      </div>
      
      {/* Project Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReadOnlyField label="Project Name" value={report.projectName} />
          <ReadOnlyField label="Submitted By" value={report.submittedBy} />
          <ReadOnlyField label="Reporting Period" value={formatReportingPeriod(report.reportingPeriod)} />
          <ReadOnlyField label="Submission Date" value={formatSubmissionDate(report.submissionDate)} />
        </CardContent>
      </Card>
      
      {/* Overall Project Health Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overall Project Health</CardTitle>
          <KPIScoreMeter score={projectHealthScore} label="Project Health Score" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReadOnlyField 
            label="Risk Level" 
            value={<RatingDisplay value={report.riskLevel} type="risk" />} 
          />
          <ReadOnlyField 
            label="Financial Health" 
            value={<RatingDisplay value={report.financialHealth} type="health" />} 
          />
          <ReadOnlyField 
            label="Customer Satisfaction" 
            value={<RatingDisplay value={report.customerSatisfaction} type="satisfaction" />} 
          />
        </CardContent>
      </Card>
      
      {/* Team KPIs Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team KPIs</CardTitle>
          <KPIScoreMeter score={teamKPIsScore} label="Team KPIs Score" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadOnlyField 
            label="Team Morale and Motivation" 
            value={<RatingDisplay value={report.teamMorale} type="morale" />} 
          />
          <ReadOnlyField 
            label="Completion of Planned Work" 
            value={<RatingDisplay value={report.completionOfPlannedWork} type="completion" />} 
          />
        </CardContent>
      </Card>
      
      {/* Departmental Performance Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Departmental Performance</CardTitle>
          <KPIScoreMeter score={departmentalScore} label="Departmental Score" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReadOnlyField 
            label="Front-End Team Quality" 
            value={<RatingDisplay value={report.frontEndQuality} type="rating" />} 
          />
          <ReadOnlyField 
            label="Back-End Team Quality" 
            value={<RatingDisplay value={report.backEndQuality} type="rating" />} 
          />
          <ReadOnlyField 
            label="Testing Team Quality" 
            value={<RatingDisplay value={report.testingQuality} type="rating" />} 
          />
          <ReadOnlyField 
            label="Design Team Quality" 
            value={<RatingDisplay value={report.designQuality} type="rating" />} 
          />
          <ReadOnlyField 
            label="Project Manager Self-Evaluation" 
            value={<RatingDisplay value={report.projectManagerEvaluation} type="rating" />} 
          />
        </CardContent>
      </Card>
      
      {/* Overall Project Score Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overall Project Score</CardTitle>
          <KPIScoreMeter score={overallProjectScore} label="Overall Score" />
        </CardHeader>
        <CardContent>
          <OverallProjectScore 
            score={overallProjectScore}
            doingWell={doingWellKPIs}
            needsAttention={needsAttentionKPIs}
          />
        </CardContent>
      </Card>
      
      {/* Additional Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Key Achievements</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{report.keyAchievements || "No key achievements recorded."}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Primary Challenges</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{report.primaryChallenges || "No primary challenges recorded."}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Next Steps</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{report.nextSteps || "No next steps recorded."}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Follow-up Actions</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{report.followUpActions || "No follow-up actions recorded."}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{report.notes || "No additional notes recorded."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportDetail;
