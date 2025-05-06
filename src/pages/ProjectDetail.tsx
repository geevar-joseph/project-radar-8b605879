
import { useParams, useNavigate } from "react-router-dom";
import { useProjectContext } from "@/context/ProjectContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tag } from "lucide-react";
import { ProjectKPIChart } from "@/components/ProjectKPIChart";
import { MonthlyReportsTable } from "@/components/MonthlyReportsTable";
import { useEffect, useState } from "react";
import { ProjectReport, RiskLevel, FinancialHealth, CompletionStatus, TeamMorale, CustomerSatisfaction, ProjectType, ProjectStatus, RatingValue } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { formatPeriod } from "@/utils/formatPeriods";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, projects, availablePeriods, selectedPeriod, setSelectedPeriod, loadAllPeriods } = useProjectContext();
  const navigate = useNavigate();
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  const [localPeriod, setLocalPeriod] = useState<string | undefined>(selectedPeriod);
  
  const project = getProject(id || "");

  // Load all available periods
  useEffect(() => {
    loadAllPeriods();
  }, []);

  // Update local period when global period changes
  useEffect(() => {
    setLocalPeriod(selectedPeriod);
  }, [selectedPeriod]);

  // When project changes, fetch all reports without period filtering
  useEffect(() => {
    if (project) {
      fetchAllProjectReports(project.projectName);
    }
  }, [project]);
  
  const fetchAllProjectReports = async (projectName: string) => {
    try {
      // First find the project in the database by name
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('project_name', projectName)
        .single();
      
      if (projectError) {
        console.error('Error fetching project:', projectError);
        // Fallback to filtering from local state if database fetch fails
        const reportsFromState = projects.filter(p => p.projectName === projectName);
        setProjectReports(reportsFromState);
        return;
      }
      
      // Then fetch all reports for this project, without any period filter
      const { data: reportsData, error: reportsError } = await supabase
        .from('project_reports')
        .select(`
          *,
          projects (
            project_name,
            client_name,
            project_type,
            project_status
          )
        `)
        .eq('project_id', projectData.id)
        .order('submission_date', { ascending: false });
      
      if (reportsError) {
        console.error('Error fetching project reports:', reportsError);
        // Fallback to filtering from local state if database fetch fails
        const reportsFromState = projects.filter(p => p.projectName === projectName);
        setProjectReports(reportsFromState);
        return;
      }
      
      // Map the reports to match our ProjectReport type with proper type casting
      const mappedReports: ProjectReport[] = reportsData.map(report => ({
        id: report.id,
        projectName: report.projects?.project_name || projectName,
        clientName: report.projects?.client_name || 'N/A',
        projectType: (report.projects?.project_type as ProjectType) || 'Service',
        projectStatus: (report.projects?.project_status as ProjectStatus) || 'Active',
        submittedBy: report.submitted_by,
        reportingPeriod: report.reporting_period,
        riskLevel: (report.risk_level as RiskLevel) || 'N.A.',
        financialHealth: (report.financial_health as FinancialHealth) || 'N.A.',
        completionOfPlannedWork: (report.completion_of_planned_work as CompletionStatus) || 'N.A.',
        teamMorale: (report.team_morale as TeamMorale) || 'N.A.',
        customerSatisfaction: (report.customer_satisfaction as CustomerSatisfaction) || 'N.A.',
        projectManagerEvaluation: (report.project_manager_evaluation as RatingValue) || 'N.A.',
        frontEndQuality: (report.front_end_quality as RatingValue) || 'N.A.',
        backEndQuality: (report.back_end_quality as RatingValue) || 'N.A.',
        testingQuality: (report.testing_quality as RatingValue) || 'N.A.',
        designQuality: (report.design_quality as RatingValue) || 'N.A.',
        overallProjectScore: report.overall_project_score,
        submissionDate: report.submission_date,
        keyAchievements: report.key_achievements || '',
        primaryChallenges: report.primary_challenges || '',
        nextSteps: report.next_steps || '',
        followUpActions: report.follow_up_actions || '',
        notes: report.notes || ''
      }));
      
      console.log('Fetched project reports:', mappedReports);
      
      if (mappedReports.length === 0) {
        // If no reports found in the database, fallback to local state
        const reportsFromState = projects.filter(p => p.projectName === projectName);
        setProjectReports(reportsFromState);
      } else {
        setProjectReports(mappedReports);
      }
    } catch (error) {
      console.error('Error fetching project reports:', error);
      // Fallback to filtering from local state if database fetch fails
      const reportsFromState = projects.filter(p => p.projectName === projectName);
      setProjectReports(reportsFromState);
    }
  };
  
  if (!project) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const formattedDate = formatDate(project.submissionDate);
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
      
      {/* Compact Header Section - Removed Score Display */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.projectName}</h1>
              <StatusBadge value={project.riskLevel} type="risk" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex gap-1">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{project.clientName || 'N/A'}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="font-normal flex items-center gap-1">
                  <Tag size={12} /> {project.projectType || 'N/A'}
                </Badge>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge value={project.projectStatus || 'Active'} type="status" />
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">PM:</span>
                <span className="font-medium">{project.assignedPM || 'N/A'}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* KPI Chart Section - Pass localPeriod to the component */}
      {projectReports.length > 0 ? (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>Project KPI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectKPIChart 
              project={projectReports[0]} 
              initialPeriod={localPeriod}
              setParentPeriod={setLocalPeriod}
              availablePeriods={availablePeriods}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>Project KPI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground">
                No performance data available for this project.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Monthly Reports Table Section - Shows all reports */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monthly Reports History</h2>
        {projectReports.length > 0 ? (
          <MonthlyReportsTable reports={projectReports} />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center">
            <p className="text-muted-foreground">
              No monthly reports found for this project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for formatting date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

export default ProjectDetail;
