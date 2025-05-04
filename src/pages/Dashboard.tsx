
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
  ).length;
  const projectsNeedingAttention = projects.filter(p => 
    p.overallProjectScore === "Fair"
  ).length;
  const projectsAtRisk = projects.filter(p => 
    p.overallProjectScore === "Poor"
  ).length;

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
            <h3 className="font-semibold text-lg">{projectsDoingWell}</h3>
            <p className="text-sm text-muted-foreground">Doing Well</p>
          </div>
        </div>
        
        {/* Projects Needing Attention Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mr-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{projectsNeedingAttention}</h3>
            <p className="text-sm text-muted-foreground">Needing Attention</p>
          </div>
        </div>
        
        {/* Projects At Risk Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center shadow-sm">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mr-4">
            <XOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{projectsAtRisk}</h3>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Project Reports</h2>
      
      {projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No project reports found for this period.</p>
          <Button asChild>
            <Link to="/submit-report">
              Submit Your First Report
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
