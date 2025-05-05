
import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export const AddProjectModal = ({ open, onOpenChange }: AddProjectModalProps) => {
  const { addProjectName } = useProjectContext();
  const [jiraCode, setJiraCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [projectType, setProjectType] = useState<string>("Service"); // Default to Service
  const [projectStatus, setProjectStatus] = useState<string>("Active"); // Default to Active
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !clientName || !projectType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the project manager's ID if one is selected
      let pmId = null;
      if (projectManager) {
        const selectedPM = teamMembers.find(member => member.name === projectManager);
        pmId = selectedPM?.id || null;
      }
      
      // Add the project to the database
      const result = await addProjectName(
        projectName,
        clientName,
        jiraCode || null,  // Ensure jiraCode is null if empty
        projectType,
        projectStatus,
        pmId
      );
      
      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to add project');
      }
      
      // Reset form and close modal
      setJiraCode("");
      setProjectName("");
      setClientName("");
      setProjectManager("");
      setProjectType("Service");
      setProjectStatus("Active");
      
      toast({
        title: "Project Added",
        description: `"${projectName}" has been added successfully.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error adding the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Enter the details for the new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jiraCode" className="text-right">
                JIRA Code
              </Label>
              <Input
                id="jiraCode"
                value={jiraCode}
                onChange={(e) => setJiraCode(e.target.value)}
                placeholder="e.g., PROJ-123"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                Project Name*
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name*
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectManager" className="text-right">
                Project Manager
              </Label>
              <Select
                value={projectManager}
                onValueChange={setProjectManager}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a project manager" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-managers" disabled>
                      No project managers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectType" className="text-right">
                Project Type*
              </Label>
              <Select
                value={projectType}
                onValueChange={setProjectType}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectStatus" className="text-right">
                Project Status*
              </Label>
              <Select
                value={projectStatus}
                onValueChange={setProjectStatus}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
