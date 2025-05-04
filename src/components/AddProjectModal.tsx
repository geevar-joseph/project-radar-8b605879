
import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectType } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamMember {
  id: string;
  name: string;
}

export const AddProjectModal = ({ open, onOpenChange }: AddProjectModalProps) => {
  const { addProject, addProjectName } = useProjectContext();
  const [jiraCode, setJiraCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name');
      
      if (error) throw error;
      
      if (data) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !clientName || !projectType) {
      return; // Don't submit if required fields are missing
    }

    setIsSubmitting(true);
    
    try {
      // Find the project manager's ID if one is selected
      let pmId = null;
      if (projectManager) {
        const selectedPM = teamMembers.find(member => member.name === projectManager);
        pmId = selectedPM?.id;
      }
      
      // Insert the project into the database
      const { data, error } = await supabase
        .from('projects')
        .insert({
          project_name: projectName,
          client_name: clientName,
          assigned_pm: pmId,
          project_type: projectType,
          project_status: "Not Started" // Default status for new projects
        })
        .select();
      
      if (error) throw error;
      
      // Add to context
      addProjectName(projectName);
      
      // Reset form and close modal
      setJiraCode("");
      setProjectName("");
      setClientName("");
      setProjectManager("");
      setProjectType("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding project:', error);
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
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectType" className="text-right">
                Project Type*
              </Label>
              <Select
                value={projectType}
                onValueChange={(value) => setProjectType(value as ProjectType)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
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
