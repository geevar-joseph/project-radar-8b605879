
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
import { ProjectReport } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, projects } = useProjectContext();
  const navigate = useNavigate();
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  
  const project = getProject(id || "");

  useEffect(() => {
    if (project) {
      // We need to check database directly to get all reports, not just filter by name
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
        const reportsFromState = projects.filter(p => 
          p.projectName === projectName
        );
        setProjectReports(reportsFromState);
        return;
      }
      
      // Then fetch all reports for this project
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
        const reportsFromState = projects.filter(p => 
          p.projectName === projectName
        );
        setProjectReports(reportsFromState);
        return;
      }
      
      // Map the reports to match our ProjectReport type
      const mappedReports = reportsData.map(report => ({
        id: report.id,
        projectName: report.projects?.project_name || projectName,
        clientName: report.projects?.client_name || 'N/A',
        projectType: report.projects?.project_type || 'N/A',
        projectStatus: report.projects?.project_status || 'N/A',
        submittedBy: report.submitted_by,
        reportingPeriod: report.reporting_period,
        riskLevel: report.risk_level,
        financialHealth: report.financial_health,
        completionOfPlannedWork: report.completion_of_planned_work,
        teamMorale: report.team_morale,
        customerSatisfaction: report.customer_satisfaction,
        projectManagerEvaluation: report.project_manager_evaluation,
        frontEndQuality: report.front_end_quality,
        backEndQuality: report.back_end_quality,
        testingQuality: report.testing_quality,
        designQuality: report.design_quality,
        overallProjectScore: report.overall_project_score,
        submissionDate: report.submission_date,
        keyAchievements: report.key_achievements,
        primaryChallenges: report.primary_challenges,
        nextSteps: report.next_steps,
        followUpActions: report.follow_up_actions,
        notes: report.notes
      }));
      
      console.log('Fetched project reports:', mappedReports);
      
      if (mappedReports.length === 0) {
        // If no reports found in the database, fallback to local state
        const reportsFromState = projects.filter(p => 
          p.projectName === projectName
        );
        setProjectReports(reportsFromState);
      } else {
        setProjectReports(mappedReports);
      }
    } catch (error) {
      console.error('Error fetching project reports:', error);
      // Fallback to filtering from local state if database fetch fails
      const reportsFromState = projects.filter(p => 
        p.projectName === projectName
      );
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
      
      {/* Compact Header Section */}
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
                <Badge variant="secondary" className="font-normal">{project.projectStatus || 'N/A'}</Badge>
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
      
      {/* KPI Chart Section */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Project KPI Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectKPIChart project={project} />
        </CardContent>
      </Card>
      
      {/* Monthly Reports Table Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monthly Reports History</h2>
        <MonthlyReportsTable reports={projectReports} />
      </div>
    </div>
  );
};

// Helper function for formatting date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export default ProjectDetail;
