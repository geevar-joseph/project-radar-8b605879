
import { ProjectReportForm } from "@/components/ProjectReportForm";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const SubmitReport = () => {
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { toast } = useToast();

  const handleDraftSaved = () => {
    setIsDraftSaved(true);
    toast({
      title: "Draft saved",
      description: "Your report has been saved as a draft."
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit Monthly Project Report</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the required fields and add detailed information about the project's status. Each section will display a real-time KPI score based on your selections.
        </p>
      </div>
      
      {isDraftSaved && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">
          <span className="font-medium">Draft saved!</span>
          <span className="ml-2">You can continue editing or submit when ready.</span>
        </div>
      )}
      
      <ProjectReportForm onDraftSaved={handleDraftSaved} />
    </div>
  );
};

export default SubmitReport;
