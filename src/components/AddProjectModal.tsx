
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectType } from "@/types/project";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddProjectModal = ({ open, onOpenChange }: AddProjectModalProps) => {
  const { addProject, teamMembers } = useProjectContext();
  const [jiraCode, setJiraCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [projectType, setProjectType] = useState<ProjectType | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !clientName || !projectManager || !projectType) {
      return; // Don't submit if required fields are missing
    }

    addProject({
      id: `P${Math.floor(Math.random() * 10000)}`, // Random ID for demo
      projectName,
      clientName,
      assignedPM: projectManager,
      startDate: new Date().toISOString(),
      projectType: projectType as ProjectType, // Cast here to ensure type safety
      jiraCode: jiraCode || `PROJ-${Math.floor(Math.random() * 10000)}`, // Use entered or generate random
    });

    // Reset form and close modal
    setJiraCode("");
    setProjectName("");
    setClientName("");
    setProjectManager("");
    setProjectType("");
    onOpenChange(false);
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
                Project Manager*
              </Label>
              <Select
                value={projectManager}
                onValueChange={setProjectManager}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a project manager" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
