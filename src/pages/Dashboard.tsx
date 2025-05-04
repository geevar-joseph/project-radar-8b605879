
import { useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectStats } from "@/components/ProjectStats";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

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
      
      <ProjectStats />
      
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
