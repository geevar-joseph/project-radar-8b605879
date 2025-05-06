import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/components/ui/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedProjects: string[];
}

interface EditTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember;
  refreshTeamMembers: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
});

export const EditTeamMemberModal = ({ open, onOpenChange, teamMember, refreshTeamMembers }: EditTeamMemberModalProps) => {
  const { projectNames, updateTeamMember } = useProjectContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState<string[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
    },
  });

  // Update form values and assigned projects when team member changes
  useEffect(() => {
    form.reset({
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
    });
    setAssignedProjects(teamMember.assignedProjects || []);
  }, [teamMember, form]);

  const filteredProjects = projectNames?.filter(
    (project) => 
      !assignedProjects.includes(project) && 
      project.toLowerCase().includes(projectSearch.toLowerCase())
  ) || [];

  const addProject = (project: string) => {
    setAssignedProjects([...assignedProjects, project]);
    setProjectSearch("");
  };

  const removeProject = (project: string) => {
    setAssignedProjects(assignedProjects.filter((p) => p !== project));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting with assigned projects:", assignedProjects);
      await updateTeamMember(teamMember.name, values.name, values.email, values.role, assignedProjects);
      toast({
        title: "Team Member Updated",
        description: `${values.name} has been updated successfully.`,
      });
      
      // Refresh the team members list to show the updated data
      refreshTeamMembers();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the team member.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Assigned Projects</FormLabel>
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Team Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
