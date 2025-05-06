
import { useState } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { generateSecurePassword } from "@/utils/password";

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTeamMemberModal = ({ open, onOpenChange }: AddTeamMemberModalProps) => {
  const { addTeamMember, projectNames } = useProjectContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [assignedProjects, setAssignedProjects] = useState<string[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredProjects = projectNames.filter(
    (project) => 
      !assignedProjects.includes(project) && 
      project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const sendWelcomeEmail = async (email: string, name: string, tempPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email, name, tempPassword }
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        return false;
      }

      console.log('Welcome email sent:', data);
      return true;
    } catch (err) {
      console.error('Exception sending welcome email:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a secure temporary password
      const tempPassword = generateSecurePassword();

      // Create the team member with the temporary password
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          name: fullName,
          email: email,
          role: role,
          temp_password: tempPassword,
          force_password_change: true
        })
        .select();

      if (error) {
        throw error;
      }

      // Send welcome email with temp password
      const emailSent = await sendWelcomeEmail(email, fullName, tempPassword);
      
      if (!emailSent) {
        toast({
          title: "Warning",
          description: "User created but failed to send welcome email. Please contact them manually.",
          variant: "destructive"
        });
      }

      // Reset form and close modal
      setFullName("");
      setEmail("");
      setRole("");
      setAssignedProjects([]);
      
      toast({
        title: "Team Member Added",
        description: `${fullName} has been added successfully. A welcome email has been sent with login details.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error adding the team member.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProject = (project: string) => {
    setAssignedProjects([...assignedProjects, project]);
    setProjectSearch("");
  };

  const removeProject = (project: string) => {
    setAssignedProjects(assignedProjects.filter((p) => p !== project));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new team member. A temporary password will be generated and emailed to them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name*
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email Address*
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role*
              </Label>
              <Select
                value={role}
                onValueChange={setRole}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Assigned Projects
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search projects"
                    value={projectSearch}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setShowProjectDropdown(true);
                    }}
                    onFocus={() => setShowProjectDropdown(true)}
                  />
                  {showProjectDropdown && filteredProjects.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredProjects.map((project) => (
                        <div
                          key={project}
                          className="px-4 py-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            addProject(project);
                            setShowProjectDropdown(false);
                          }}
                        >
                          {project}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignedProjects.map((project) => (
                    <Badge key={project} variant="secondary" className="flex items-center gap-1">
                      {project}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeProject(project)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Team Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
