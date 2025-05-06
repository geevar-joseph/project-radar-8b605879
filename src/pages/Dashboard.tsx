
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, FolderPlus, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to the Project Manager</h1>
        <p className="text-muted-foreground mt-2">
          Manage your projects and submit monthly reports using the options below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderPlus className="h-5 w-5 mr-2" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage all your project details in one place.
            </p>
            <Button asChild>
              <Link to="/projects">View Projects</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Submit Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create monthly reports for your projects with detailed KPIs.
            </p>
            <Button asChild>
              <Link to="/submit-report">New Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Manage Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure system options and manage team members.
            </p>
            <Button asChild>
              <Link to="/manage-options">Configuration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
