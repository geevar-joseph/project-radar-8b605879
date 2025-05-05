
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
import { 
  RatingValue, 
  RiskLevel, 
  FinancialHealth, 
  CompletionStatus, 
  TeamMorale,
  CustomerSatisfaction
} from "@/types/project";
import { useMemo } from "react";

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
      riskLevel: "Low",
      financialHealth: "Healthy",
      completionOfPlannedWork: "Mostly",
      teamMorale: "High",
      customerSatisfaction: "Satisfied",
      projectManagerEvaluation: "Good",
      frontEndQuality: "Good",
      backEndQuality: "Good",
      testingQuality: "Good",
      designQuality: "Good",
      notes: "",
      keyAchievements: "",
      primaryChallenges: "",
      nextSteps: "",
      followUpActions: ""
    },
  });
  
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
                    {field.value && <ScoreIndicator value={field.value as RatingValue} />}
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
                  {field.value && <ScoreIndicator value={field.value as CustomerSatisfaction} />}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Very Satisfied">
                <ScoreIndicator value="Very Satisfied" />
              </SelectItem>
              <SelectItem value="Satisfied">
                <ScoreIndicator value="Satisfied" />
              </SelectItem>
              <SelectItem value="Neutral / Unclear">
                <ScoreIndicator value="Neutral / Unclear" />
              </SelectItem>
              <SelectItem value="Dissatisfied">
                <ScoreIndicator value="Dissatisfied" />
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
                  {field.value && <ScoreIndicator value={field.value as RiskLevel} />}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Low">
                <ScoreIndicator value="Low" />
              </SelectItem>
              <SelectItem value="Medium">
                <ScoreIndicator value="Medium" />
              </SelectItem>
              <SelectItem value="High">
                <ScoreIndicator value="High" />
              </SelectItem>
              <SelectItem value="Critical">
                <ScoreIndicator value="Critical" />
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
                  {field.value && <ScoreIndicator value={field.value as FinancialHealth} />}
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
                  {field.value && <ScoreIndicator value={field.value as CompletionStatus} />}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="All completed">
                <ScoreIndicator value="All completed" />
              </SelectItem>
              <SelectItem value="Mostly">
                <ScoreIndicator value="Mostly" />
              </SelectItem>
              <SelectItem value="Partially">
                <ScoreIndicator value="Partially" />
              </SelectItem>
              <SelectItem value="Not completed">
                <ScoreIndicator value="Not completed" />
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
                  {field.value && <ScoreIndicator value={field.value as TeamMorale} />}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="High">
                <ScoreIndicator value="High" />
              </SelectItem>
              <SelectItem value="Moderate">
                <ScoreIndicator value="Moderate" />
              </SelectItem>
              <SelectItem value="Low">
                <ScoreIndicator value="Low" />
              </SelectItem>
              <SelectItem value="Burnt Out">
                <ScoreIndicator value="Burnt Out" />
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
        
        <Card>
          <CardHeader>
            <CardTitle>Overall Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderRiskLevelField()}
              {renderFinancialHealthField()}
              {renderCustomerSatisfactionField()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Team KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderTeamMoraleField()}
              {renderCompletionStatusField()} {/* Moved from Project Health to Team KPIs */}
              {/* Project Manager Self-Evaluation is in Departmental Performance section */}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Departmental Performance</CardTitle>
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
