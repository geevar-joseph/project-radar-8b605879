
import { ProjectReportForm } from "@/components/ProjectReportForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SubmitReport = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Submit Monthly Project Report</h1>
        <Button variant="outline" asChild>
          <Link to="/manage-options">Manage Projects & Users</Link>
        </Button>
      </div>
      <ProjectReportForm />
    </div>
  );
};

export default SubmitReport;
