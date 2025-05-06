import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; 
import { useProjectContext } from "@/context/ProjectContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { ScoreIndicator } from "./ScoreIndicator";
import { KPIScoreMeter } from "./KPIScoreMeter";
import { OverallProjectScore } from "./OverallProjectScore";
import { useState, useEffect, useMemo } from "react";
import { TeamMember } from "@/hooks/useTeamMembers";
import { 
  RatingValue, 
  RiskLevel, 
  FinancialHealth, 
  CompletionStatus, 
  TeamMorale,
  CustomerSatisfaction,
  ratingToValueMap,
  riskToValueMap,
  financialToValueMap,
  completionToValueMap,
  moraleToValueMap,
  satisfactionToValueMap
} from "@/types/project";

const formSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  submittedBy: z.string().min(2, "Submitter name must be at least 2 characters"),
  reportingPeriod: z.string().min(6, "Reporting period is required"),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical", "N.A."]),
  financialHealth: z.enum(["Healthy", "On Watch", "At Risk", "Critical", "N.A."]),
  completionOfPlannedWork: z.enum(["Completely", "Mostly", "Partially", "Not completed", "N.A."]),
  teamMorale: z.enum(["High", "Moderate", "Low", "Burnt Out", "N.A."]),
  customerSatisfaction: z.enum(["Very Satisfied", "Satisfied", "Neutral / Unclear", "Dissatisfied", "N.A."]),
  projectManagerEvaluation: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  frontEndQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  backEndQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  testingQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  designQuality: z.enum(["Excellent", "Good", "Fair", "Poor", "N.A."]),
  notes: z.string().optional(),
  keyAchievements: z.string().optional(),
  primaryChallenges: z.string().optional(),
  nextSteps: z.string().optional(),
  followUpActions: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectReportFormProps {
  onDraftSaved?: () => void;
}

export function ProjectReportForm({ onDraftSaved }: ProjectReportFormProps) {
  const { addProject, projectNames, teamMembers, projects } = useProjectContext();
  const navigate = useNavigate();
  
  // States to track KPI scores
  const [projectHealthScore, setProjectHealthScore] = useState<number | null>(null);
  const [teamKPIsScore, setTeamKPIsScore] = useState<number | null>(null);
  const [departmentalScore, setDepartmentalScore] = useState<number | null>(null);
  
  // Add a new state for overall project score
  const [overallProjectScore, setOverallProjectScore] = useState<number | null>(null);
  const [doingWellKPIs, setDoingWellKPIs] = useState<string[]>([]);
  const [needsAttentionKPIs, setNeedsAttentionKPIs] = useState<string[]>([]);
  
  // New state for period validation
  const [periodExists, setPeriodExists] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Generate the last 3 months options (current month and previous 2 months)
  const reportingPeriodOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const formattedDate = `${year}-${month}`;
      
      // Create a readable label (e.g. "May 2025")
      const monthName = date.toLocaleString('default', { month: 'long' });
      const label = `${monthName} ${year}`;
      
      options.push({ value: formattedDate, label });
    }
    
    return options;
  }, []);
  
  // Get team member names from teamMembers objects for use in the form
  const teamMemberNames = useMemo(() => {
    return teamMembers.map(member => member.name);
  }, [teamMembers]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: projectNames[0] || "",
      submittedBy: teamMemberNames[0] || "",
      reportingPeriod: reportingPeriodOptions[0]?.value || "",
      riskLevel: "N.A.",
      financialHealth: "N.A.",
      completionOfPlannedWork: "N.A.",
      teamMorale: "N.A.",
      customerSatisfaction: "N.A.",
      projectManagerEvaluation: "N.A.",
      frontEndQuality: "N.A.",
      backEndQuality: "N.A.",
      testingQuality: "N.A.",
      designQuality: "N.A.",
      notes: "",
      keyAchievements: "",
      primaryChallenges: "",
      nextSteps: "",
      followUpActions: ""
    },
  });

  // Check if a report exists for the selected project and period
  useEffect(() => {
    const currentProjectName = form.watch("projectName");
    const currentPeriod = form.watch("reportingPeriod");
    
    if (currentProjectName && currentPeriod) {
      const reportExists = projects.some(
        project => project.projectName === currentProjectName && 
                  project.reportingPeriod === currentPeriod
      );
      
      setPeriodExists(reportExists);
      setSelectedProject(currentProjectName);
    }
  }, [form.watch("projectName"), form.watch("reportingPeriod"), projects]);

  // Calculate scores whenever form values change
  const formValues = form.watch();
  
  useEffect(() => {
    // Calculate Project Health Score
    const riskScore = riskToValueMap[formValues.riskLevel];
    const financialScore = financialToValueMap[formValues.financialHealth];
    const satisfactionScore = satisfactionToValueMap[formValues.customerSatisfaction];
    
    const healthScores = [riskScore, financialScore, satisfactionScore].filter(score => score !== null) as number[];
    const healthAverage = healthScores.length > 0 
      ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length 
      : null;
    
    setProjectHealthScore(healthAverage);
    
    // Calculate Team KPIs Score
    const moraleScore = moraleToValueMap[formValues.teamMorale];
    const completionScore = completionToValueMap[formValues.completionOfPlannedWork];
    
    const teamScores = [moraleScore, completionScore].filter(score => score !== null) as number[];
    const teamAverage = teamScores.length > 0 
      ? teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length 
      : null;
    
    setTeamKPIsScore(teamAverage);
    
    // Calculate Departmental Performance Score
    const pmScore = ratingToValueMap[formValues.projectManagerEvaluation];
    const frontEndScore = ratingToValueMap[formValues.frontEndQuality];
    const backEndScore = ratingToValueMap[formValues.backEndQuality];
    const testingScore = ratingToValueMap[formValues.testingQuality];
    const designScore = ratingToValueMap[formValues.designQuality];
    
    const deptScores = [pmScore, frontEndScore, backEndScore, testingScore, designScore]
      .filter(score => score !== null) as number[];
    const deptAverage = deptScores.length > 0 
      ? deptScores.reduce((sum, score) => sum + score, 0) / deptScores.length 
      : null;
    
    setDepartmentalScore(deptAverage);
    
    // Calculate Overall Project Score (average of all scores)
    const allScores = [healthAverage, teamAverage, deptAverage].filter(score => score !== null) as number[];
    const overallAverage = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : null;
    
    setOverallProjectScore(overallAverage);
    
    // Identify doing well and needs attention areas
    const doingWell: string[] = [];
    const needsAttention: string[] = [];
    
    // Check risk level
    if (riskToValueMap[formValues.riskLevel] !== null) {
      if (riskToValueMap[formValues.riskLevel] >= 3) {
        doingWell.push('Risk Management');
      } else if (riskToValueMap[formValues.riskLevel] !== null && riskToValueMap[formValues.riskLevel] <= 2) {
        needsAttention.push('Risk Management');
      }
    }
    
    // Check financial health
    if (financialToValueMap[formValues.financialHealth] !== null) {
      if (financialToValueMap[formValues.financialHealth] >= 3) {
        doingWell.push('Financial Health');
      } else if (financialToValueMap[formValues.financialHealth] !== null && financialToValueMap[formValues.financialHealth] <= 2) {
        needsAttention.push('Financial Health');
      }
    }
    
    // Check customer satisfaction
    if (satisfactionToValueMap[formValues.customerSatisfaction] !== null) {
      if (satisfactionToValueMap[formValues.customerSatisfaction] >= 3) {
        doingWell.push('Customer Satisfaction');
      } else if (satisfactionToValueMap[formValues.customerSatisfaction] !== null && satisfactionToValueMap[formValues.customerSatisfaction] <= 2) {
        needsAttention.push('Customer Satisfaction');
      }
    }
    
    // Check team morale
    if (moraleToValueMap[formValues.teamMorale] !== null) {
      if (moraleToValueMap[formValues.teamMorale] >= 3) {
        doingWell.push('Team Morale');
      } else if (moraleToValueMap[formValues.teamMorale] !== null && moraleToValueMap[formValues.teamMorale] <= 2) {
        needsAttention.push('Team Morale');
      }
    }
    
    // Check completion status
    if (completionToValueMap[formValues.completionOfPlannedWork] !== null) {
      if (completionToValueMap[formValues.completionOfPlannedWork] >= 3) {
        doingWell.push('Work Completion');
      } else if (completionToValueMap[formValues.completionOfPlannedWork] !== null && completionToValueMap[formValues.completionOfPlannedWork] <= 2) {
        needsAttention.push('Work Completion');
      }
    }
    
    // Check departmental quality scores
    if (ratingToValueMap[formValues.projectManagerEvaluation] !== null) {
      if (ratingToValueMap[formValues.projectManagerEvaluation] >= 3) {
        doingWell.push('Project Management');
      } else if (ratingToValueMap[formValues.projectManagerEvaluation] !== null && ratingToValueMap[formValues.projectManagerEvaluation] <= 2) {
        needsAttention.push('Project Management');
      }
    }
    
    if (ratingToValueMap[formValues.frontEndQuality] !== null) {
      if (ratingToValueMap[formValues.frontEndQuality] >= 3) {
        doingWell.push('Front-End Quality');
      } else if (ratingToValueMap[formValues.frontEndQuality] !== null && ratingToValueMap[formValues.frontEndQuality] <= 2) {
        needsAttention.push('Front-End Quality');
      }
    }
    
    if (ratingToValueMap[formValues.backEndQuality] !== null) {
      if (ratingToValueMap[formValues.backEndQuality] >= 3) {
        doingWell.push('Back-End Quality');
      } else if (ratingToValueMap[formValues.backEndQuality] !== null && ratingToValueMap[formValues.backEndQuality] <= 2) {
        needsAttention.push('Back-End Quality');
      }
    }
    
    if (ratingToValueMap[formValues.testingQuality] !== null) {
      if (ratingToValueMap[formValues.testingQuality] >= 3) {
        doingWell.push('Testing Quality');
      } else if (ratingToValueMap[formValues.testingQuality] !== null && ratingToValueMap[formValues.testingQuality] <= 2) {
        needsAttention.push('Testing Quality');
      }
    }
    
    if (ratingToValueMap[formValues.designQuality] !== null) {
      if (ratingToValueMap[formValues.designQuality] >= 3) {
        doingWell.push('Design Quality');
      } else if (ratingToValueMap[formValues.designQuality] !== null && ratingToValueMap[formValues.designQuality] <= 2) {
        needsAttention.push('Design Quality');
      }
    }
    
    setDoingWellKPIs(doingWell);
    setNeedsAttentionKPIs(needsAttention);
  }, [formValues]);
  
  function onSubmit(data: FormValues) {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find the appropriate overall score based on the calculated value
    let scoreRating: RatingValue = "N.A.";
    if (overallProjectScore !== null) {
      if (overallProjectScore >= 3.5) scoreRating = "Excellent";
      else if (overallProjectScore >= 2.5) scoreRating = "Good";
      else if (overallProjectScore >= 1.5) scoreRating = "Fair";
      else scoreRating = "Poor";
    }
    
    // Ensure all required fields are present
    const newProject = {
      id: uuidv4(),
      submissionDate: currentDate,
      projectName: data.projectName,
      submittedBy: data.submittedBy,
      reportingPeriod: data.reportingPeriod,
      riskLevel: data.riskLevel as RiskLevel,
      financialHealth: data.financialHealth as FinancialHealth,
      completionOfPlannedWork: data.completionOfPlannedWork as CompletionStatus,
      teamMorale: data.teamMorale as TeamMorale,
      customerSatisfaction: data.customerSatisfaction as CustomerSatisfaction,
      projectManagerEvaluation: data.projectManagerEvaluation as RatingValue,
      frontEndQuality: data.frontEndQuality as RatingValue,
      backEndQuality: data.backEndQuality as RatingValue,
      testingQuality: data.testingQuality as RatingValue,
      designQuality: data.designQuality as RatingValue,
      // Add the calculated overall score
      overallProjectScore: scoreRating,
      // Add the new fields
      notes: data.notes,
      keyAchievements: data.keyAchievements,
      primaryChallenges: data.primaryChallenges,
      nextSteps: data.nextSteps,
      followUpActions: data.followUpActions
    };
    
    addProject(newProject);
    navigate('/dashboard');
  }

  function saveDraft() {
    // Get current form values, even if incomplete
    const formData = form.getValues();
    
    // Save to localStorage with timestamp
    const draft = {
      data: formData,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('projectReport_draft', JSON.stringify(draft));
    
    // Notify parent component
    if (onDraftSaved) {
      onDraftSaved();
    }
  }

  // Render a field with a ScoreIndicator for any rating-type field
  const renderScoreField = (name: keyof FormValues, label: string) => {
    if (!['projectManagerEvaluation', 'frontEndQuality', 'backEndQuality', 'testingQuality', 'designQuality'].includes(name)) {
      return null;
    }
    
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating">
                    {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as RatingValue} type="rating" />}
                    {(!field.value || field.value === "N.A.") && "Select rating"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Excellent">
                  <ScoreIndicator value="Excellent" type="rating" />
                </SelectItem>
                <SelectItem value="Good">
                  <ScoreIndicator value="Good" type="rating" />
                </SelectItem>
                <SelectItem value="Fair">
                  <ScoreIndicator value="Fair" type="rating" />
                </SelectItem>
                <SelectItem value="Poor">
                  <ScoreIndicator value="Poor" type="rating" />
                </SelectItem>
                <SelectItem value="N.A.">
                  <ScoreIndicator value="N.A." type="rating" />
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Customer satisfaction field
  const renderCustomerSatisfactionField = () => (
    <FormField
      control={form.control}
      name="customerSatisfaction"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer Satisfaction</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select satisfaction level">
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as CustomerSatisfaction} type="satisfaction" />}
                  {(!field.value || field.value === "N.A.") && "Select satisfaction level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Very Satisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Very Satisfied" type="satisfaction" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Customers are highly complimentary</span>
                </div>
              </SelectItem>
              <SelectItem value="Satisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Satisfied" type="satisfaction" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Customers are generally pleased</span>
                </div>
              </SelectItem>
              <SelectItem value="Neutral / Unclear">
                <div className="flex flex-col">
                  <ScoreIndicator value="Neutral / Unclear" type="satisfaction" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Mixed feedback or limited communication</span>
                </div>
              </SelectItem>
              <SelectItem value="Dissatisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Dissatisfied" type="satisfaction" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Multiple complaints or issues raised</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." type="satisfaction" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">No customer interaction this period</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Risk level field with updated options
  const renderRiskLevelField = () => (
    <FormField
      control={form.control}
      name="riskLevel"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Risk Level</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level">
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as RiskLevel} type="risk" />}
                  {(!field.value || field.value === "N.A.") && "Select risk level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Low">
                <div className="flex flex-col">
                  <ScoreIndicator value="Low" type="risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Project has minimal identified risks</span>
                </div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex flex-col">
                  <ScoreIndicator value="Medium" type="risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Some risks identified but manageable</span>
                </div>
              </SelectItem>
              <SelectItem value="High">
                <div className="flex flex-col">
                  <ScoreIndicator value="High" type="risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Significant risks requiring mitigation</span>
                </div>
              </SelectItem>
              <SelectItem value="Critical">
                <div className="flex flex-col">
                  <ScoreIndicator value="Critical" type="risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Major issues threatening project success</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." type="risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Risk assessment not applicable</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Financial health field with updated options
  const renderFinancialHealthField = () => (
    <FormField
      control={form.control}
      name="financialHealth"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Financial Health</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select financial status">
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as FinancialHealth} type="health" />}
                  {(!field.value || field.value === "N.A.") && "Select financial status"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Healthy">
                <div className="flex flex-col">
                  <ScoreIndicator value="Healthy" type="health" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Project is on budget with strong margins</span>
                </div>
              </SelectItem>
              <SelectItem value="On Watch">
                <div className="flex flex-col">
                  <ScoreIndicator value="On Watch" type="health" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Minor budget concerns or margin trend declining</span>
                </div>
              </SelectItem>
              <SelectItem value="At Risk">
                <div className="flex flex-col">
                  <ScoreIndicator value="At Risk" type="health" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Over budget or margin pressure is material</span>
                </div>
              </SelectItem>
              <SelectItem value="Critical">
                <div className="flex flex-col">
                  <ScoreIndicator value="Critical" type="health" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Significantly over budget and/or negative margin</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." type="health" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Not applicable or insufficient financial data</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Updated Team Morale field with descriptions
  const renderTeamMoraleField = () => (
    <FormField
      control={form.control}
      name="teamMorale"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Team Morale and Motivation</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select morale level">
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as TeamMorale} type="morale" />}
                  {(!field.value || field.value === "N.A.") && "Select morale level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="High">
                <div className="flex flex-col">
                  <ScoreIndicator value="High" type="morale" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is energized and highly motivated</span>
                </div>
              </SelectItem>
              <SelectItem value="Moderate">
                <div className="flex flex-col">
                  <ScoreIndicator value="Moderate" type="morale" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is generally positive but not exceptional</span>
                </div>
              </SelectItem>
              <SelectItem value="Low">
                <div className="flex flex-col">
                  <ScoreIndicator value="Low" type="morale" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team shows signs of discouragement</span>
                </div>
              </SelectItem>
              <SelectItem value="Burnt Out">
                <div className="flex flex-col">
                  <ScoreIndicator value="Burnt Out" type="morale" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is exhausted and morale is critically low</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." type="morale" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Unable to assess team morale</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Updated Completion of Planned Work field with descriptions
  const renderCompletionStatusField = () => (
    <FormField
      control={form.control}
      name="completionOfPlannedWork"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Completion of Planned Work</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select completion status">
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as CompletionStatus} type="completion" />}
                  {(!field.value || field.value === "N.A.") && "Select completion status"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Completely">
                <div className="flex flex-col">
                  <ScoreIndicator value="Completely" type="completion" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">100% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Mostly">
                <div className="flex flex-col">
                  <ScoreIndicator value="Mostly" type="completion" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">75-99% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Partially">
                <div className="flex flex-col">
                  <ScoreIndicator value="Partially" type="completion" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">40-74% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Not completed">
                <div className="flex flex-col">
                  <ScoreIndicator value="Not completed" type="completion" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Less than 40% of planned work completed</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." type="completion" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">No planned work to measure</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Name Field - Updated with Command for searching */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Name</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select a project"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 z-50" align="start">
                      <Command className="rounded-md border shadow-md">
                        <CommandInput placeholder="Search projects..." />
                        <CommandList>
                          <CommandEmpty>No project found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {projectNames.map((project) => (
                              <CommandItem
                                key={project}
                                value={project}
                                onSelect={() => {
                                  form.setValue("projectName", project);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    project === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {project}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submitted By Field - Updated with Command for searching */}
            <FormField
              control={form.control}
              name="submittedBy"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Submitted By</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select team member"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 z-50" align="start">
                      <Command className="rounded-md border shadow-md">
                        <CommandInput placeholder="Search team members..." />
                        <CommandList>
                          <CommandEmpty>No team member found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {teamMemberNames.map((memberName) => (
                              <CommandItem
                                key={memberName}
                                value={memberName}
                                onSelect={() => {
                                  form.setValue("submittedBy", memberName);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    memberName === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {memberName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reporting Period Field - Modified to remove ScoreIndicator since "period" is not a valid type */}
            <FormField
              control={form.control}
              name="reportingPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reporting period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="N.A.">
                        No reporting period selected
                      </SelectItem>
                      {reportingPeriodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show warning if report already exists */}
            {periodExists && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <span className="font-medium">Warning:</span>
                <span className="ml-2">A report already exists for {selectedProject} in this period.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ... keep existing code (remaining cards and form fields) */}

        {/* Form Action Buttons */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={saveDraft}
          >
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </Form>
  );
}
