
import { useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Check, AlertTriangle, XOctagon } from "lucide-react";

const Dashboard = () => {
  const { 
    getFilteredProjects, 
    getUniqueReportingPeriods, 
    selectedPeriod, 
    setSelectedPeriod 
  } = useProjectContext();
  
  const periods = getUniqueReportingPeriods();
  const projects = getFilteredProjects(selectedPeriod);
  
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0]);
    }
  }, [periods, selectedPeriod, setSelectedPeriod]);

  // Calculate project statistics based on scores
  const totalProjects = projects.length;
  const projectsDoingWell = projects.filter(p => 
    p.overallProjectScore === "Excellent" || p.overallProjectScore === "Good"
  );
  const projectsNeedingAttention = projects.filter(p => 
    p.overallProjectScore === "Fair"
  );
  const projectsAtRisk = projects.filter(p => 
    p.overallProjectScore === "Poor"
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Reports Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedPeriod 
              ? `Viewing data for period ${selectedPeriod}` 
              : "Viewing all project data"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <div className="w-48">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
                <SelectItem value={undefined}>All Periods</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button asChild>
            <Link to="/submit-report">
              Submit New Report
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Block 1: Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Projects Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mr-4">
            <span className="text-blue-600 dark:text-blue-400 text-lg">
              {totalProjects}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Total Projects</h3>
            <p className="text-sm text-muted-foreground">
              {selectedPeriod ? `For ${selectedPeriod}` : "All periods"}
            </p>
          </div>
        </div>
        
        {/* Projects Doing Well Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{projectsDoingWell.length}</h3>
            <p className="text-sm text-muted-foreground">Doing Well</p>
          </div>
        </div>
        
        {/* Projects Needing Attention Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mr-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{projectsNeedingAttention.length}</h3>
            <p className="text-sm text-muted-foreground">Needing Attention</p>
          </div>
        </div>
        
        {/* Projects At Risk Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mr-4">
            <XOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{projectsAtRisk.length}</h3>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </div>
        </div>
      </div>
      
      {/* Block 2: Categorized Project List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Column 1: Projects Doing Well */}
        <div className="border-t-4 border-green-500 bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            Projects Doing Well ({projectsDoingWell.length})
          </h2>
          
          <div className="space-y-4">
            {projectsDoingWell.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>No projects in this category</p>
              </div>
            ) : (
              projectsDoingWell.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <Link to={`/project/${project.id}`} className="font-medium text-lg hover:underline">
                    {project.projectName}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    PM: {project.assignedPM || 'Unassigned'}
                  </p>
                  <div className="flex mt-2">
                    <StatusBadge value={project.overallProjectScore} type="rating" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Column 2: Projects Needing Attention */}
        <div className="border-t-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
            Projects Needing Attention ({projectsNeedingAttention.length})
          </h2>
          
          <div className="space-y-4">
            {projectsNeedingAttention.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>No projects in this category</p>
              </div>
            ) : (
              projectsNeedingAttention.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <Link to={`/project/${project.id}`} className="font-medium text-lg hover:underline">
                    {project.projectName}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    PM: {project.assignedPM || 'Unassigned'}
                  </p>
                  <div className="flex mt-2">
                    <StatusBadge value={project.overallProjectScore} type="rating" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Column 3: Projects At Risk */}
        <div className="border-t-4 border-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <XOctagon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            Projects At Risk ({projectsAtRisk.length})
          </h2>
          
          <div className="space-y-4">
            {projectsAtRisk.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>No projects in this category</p>
              </div>
            ) : (
              projectsAtRisk.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <Link to={`/project/${project.id}`} className="font-medium text-lg hover:underline">
                    {project.projectName}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    PM: {project.assignedPM || 'Unassigned'}
                  </p>
                  <div className="flex mt-2">
                    <StatusBadge value={project.overallProjectScore} type="rating" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No project reports found for this period.</p>
          <Button asChild>
            <Link to="/submit-report">
              Submit Your First Report
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
