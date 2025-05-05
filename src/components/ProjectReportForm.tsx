import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; 
import { useProjectContext } from "@/context/ProjectContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { ScoreIndicator } from "./ScoreIndicator";
import { Save } from "lucide-react";
import { KPIScoreMeter } from "./KPIScoreMeter";
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
import { useMemo, useState, useEffect } from "react";

const formSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  submittedBy: z.string().min(2, "Submitter name must be at least 2 characters"),
  reportingPeriod: z.string().min(6, "Reporting period is required"),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical", "N.A."]),
  financialHealth: z.enum(["Healthy", "On Watch", "At Risk", "Critical", "N.A."]),
  completionOfPlannedWork: z.enum(["All completed", "Mostly", "Partially", "Not completed", "N.A."]),
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
  const { addProject, projectNames, teamMembers } = useProjectContext();
  const navigate = useNavigate();
  
  // States to track KPI scores
  const [projectHealthScore, setProjectHealthScore] = useState<number | null>(null);
  const [teamKPIsScore, setTeamKPIsScore] = useState<number | null>(null);
  const [departmentalScore, setDepartmentalScore] = useState<number | null>(null);

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: projectNames[0] || "",
      submittedBy: teamMembers[0] || "",
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
  }, [formValues]);
  
  function onSubmit(data: FormValues) {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Ensure all required fields are present
    const newProject = {
      id: uuidv4(),
      submissionDate: currentDate,
      projectName: data.projectName,
      submittedBy: data.submittedBy,
      reportingPeriod: data.reportingPeriod,
      riskLevel: data.riskLevel,
      financialHealth: data.financialHealth,
      completionOfPlannedWork: data.completionOfPlannedWork,
      teamMorale: data.teamMorale,
      customerSatisfaction: data.customerSatisfaction,
      projectManagerEvaluation: data.projectManagerEvaluation,
      frontEndQuality: data.frontEndQuality,
      backEndQuality: data.backEndQuality,
      testingQuality: data.testingQuality,
      designQuality: data.designQuality,
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
                    {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as RatingValue} />}
                    {(!field.value || field.value === "N.A.") && "Select rating"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Excellent">
                  <ScoreIndicator value="Excellent" />
                </SelectItem>
                <SelectItem value="Good">
                  <ScoreIndicator value="Good" />
                </SelectItem>
                <SelectItem value="Fair">
                  <ScoreIndicator value="Fair" />
                </SelectItem>
                <SelectItem value="Poor">
                  <ScoreIndicator value="Poor" />
                </SelectItem>
                <SelectItem value="N.A.">
                  <ScoreIndicator value="N.A." />
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
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as CustomerSatisfaction} />}
                  {(!field.value || field.value === "N.A.") && "Select satisfaction level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Very Satisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Very Satisfied" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Customers are highly complimentary</span>
                </div>
              </SelectItem>
              <SelectItem value="Satisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Satisfied" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Customers are generally pleased</span>
                </div>
              </SelectItem>
              <SelectItem value="Neutral / Unclear">
                <div className="flex flex-col">
                  <ScoreIndicator value="Neutral / Unclear" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Mixed feedback or limited communication</span>
                </div>
              </SelectItem>
              <SelectItem value="Dissatisfied">
                <div className="flex flex-col">
                  <ScoreIndicator value="Dissatisfied" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Multiple complaints or issues raised</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." />
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
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as RiskLevel} />}
                  {(!field.value || field.value === "N.A.") && "Select risk level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Low">
                <div className="flex flex-col">
                  <ScoreIndicator value="Low" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Project has minimal identified risks</span>
                </div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex flex-col">
                  <ScoreIndicator value="Medium" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Some risks identified but manageable</span>
                </div>
              </SelectItem>
              <SelectItem value="High">
                <div className="flex flex-col">
                  <ScoreIndicator value="High" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Significant risks requiring mitigation</span>
                </div>
              </SelectItem>
              <SelectItem value="Critical">
                <div className="flex flex-col">
                  <ScoreIndicator value="Critical" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Major issues threatening project success</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." />
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
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as FinancialHealth} />}
                  {(!field.value || field.value === "N.A.") && "Select financial status"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Healthy">
                <div className="flex flex-col">
                  <ScoreIndicator value="Healthy" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Project is on budget with strong margins</span>
                </div>
              </SelectItem>
              <SelectItem value="On Watch">
                <div className="flex flex-col">
                  <ScoreIndicator value="On Watch" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Minor budget concerns or margin trend declining</span>
                </div>
              </SelectItem>
              <SelectItem value="At Risk">
                <div className="flex flex-col">
                  <ScoreIndicator value="At Risk" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Over budget or margin pressure is material</span>
                </div>
              </SelectItem>
              <SelectItem value="Critical">
                <div className="flex flex-col">
                  <ScoreIndicator value="Critical" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Significantly over budget and/or negative margin</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." />
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
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as TeamMorale} />}
                  {(!field.value || field.value === "N.A.") && "Select morale level"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="High">
                <div className="flex flex-col">
                  <ScoreIndicator value="High" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is energized and highly motivated</span>
                </div>
              </SelectItem>
              <SelectItem value="Moderate">
                <div className="flex flex-col">
                  <ScoreIndicator value="Moderate" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is generally positive but not exceptional</span>
                </div>
              </SelectItem>
              <SelectItem value="Low">
                <div className="flex flex-col">
                  <ScoreIndicator value="Low" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team shows signs of discouragement</span>
                </div>
              </SelectItem>
              <SelectItem value="Burnt Out">
                <div className="flex flex-col">
                  <ScoreIndicator value="Burnt Out" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Team is exhausted and morale is critically low</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." />
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
                  {field.value && field.value !== "N.A." && <ScoreIndicator value={field.value as CompletionStatus} />}
                  {(!field.value || field.value === "N.A.") && "Select completion status"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="All completed">
                <div className="flex flex-col">
                  <ScoreIndicator value="All completed" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">100% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Mostly">
                <div className="flex flex-col">
                  <ScoreIndicator value="Mostly" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">75-99% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Partially">
                <div className="flex flex-col">
                  <ScoreIndicator value="Partially" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">40-74% of planned deliverables completed</span>
                </div>
              </SelectItem>
              <SelectItem value="Not completed">
                <div className="flex flex-col">
                  <ScoreIndicator value="Not completed" />
                  <span className="text-xs text-gray-500 ml-6 mt-0.5">Less than 40% of planned work completed</span>
                </div>
              </SelectItem>
              <SelectItem value="N.A.">
                <div className="flex flex-col">
                  <ScoreIndicator value="N.A." />
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
            {/* Project Name Field */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectNames.map(name => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submitted By Field */}
            <FormField
              control={form.control}
              name="submittedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submitted By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map(name => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reporting Period Field */}
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
                      {reportingPeriodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the month and year for this report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Overall Project Health Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Overall Project Health</CardTitle>
            <KPIScoreMeter score={projectHealthScore} label="Project Health Score" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderRiskLevelField()}
              {renderFinancialHealthField()}
              {renderCustomerSatisfactionField()}
            </div>
          </CardContent>
        </Card>
        
        {/* Team KPIs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team KPIs</CardTitle>
            <KPIScoreMeter score={teamKPIsScore} label="Team KPIs Score" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderTeamMoraleField()}
              {renderCompletionStatusField()}
            </div>
          </CardContent>
        </Card>
        
        {/* Departmental Performance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departmental Performance</CardTitle>
            <KPIScoreMeter score={departmentalScore} label="Departmental Score" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderScoreField('frontEndQuality', 'Front-End Team Quality')}
              {renderScoreField('backEndQuality', 'Back-End Team Quality')}
              {renderScoreField('testingQuality', 'Testing Team Quality')}
              {renderScoreField('designQuality', 'Design Team Quality')}
              {renderScoreField('projectManagerEvaluation', 'Project Manager Self-Evaluation')}
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="keyAchievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Achievements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List key milestones and achievements from this reporting period"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryChallenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Challenges</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any major challenges or blockers faced during this period"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Steps</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Outline planned tasks and milestones for the next reporting period"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpActions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Actions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List any actions needed from management or other teams"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any other comments or information to include in the report"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            type="button" 
            onClick={saveDraft}
          >
            <Save className="mr-1 h-4 w-4" />
            Save Draft
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </Form>
  );
}
