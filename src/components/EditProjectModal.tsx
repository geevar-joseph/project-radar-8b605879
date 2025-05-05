
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { ProjectType, ProjectStatus } from "@/types/project";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

// Define valid project types and statuses for validation
const validProjectTypes = ["Service", "Product"] as const;
const validProjectStatuses = ["Active", "Inactive", "Support"] as const;

const formSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  clientName: z.string().optional(),
  jiraId: z.string().optional(),
  projectType: z.enum(validProjectTypes).optional(),
  projectStatus: z.enum(validProjectStatuses).optional(),
  assignedPM: z.string().optional(),
});

export const EditProjectModal = ({ open, onOpenChange, projectName }: EditProjectModalProps) => {
  const { 
    updateProjectDetails, 
    projects, 
    teamMembers,
    loadProjects 
  } = useProjectContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [teamMemberOptions, setTeamMemberOptions] = useState<Array<{id: string, name: string}>>([]);

  // Find the current project data
  const currentProject = projects.find(p => p.projectName === projectName);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      jiraId: "",
      projectType: "Service" as const,
      projectStatus: "Active" as const,
      assignedPM: "",
    },
  });

  // Fetch full team member data on component mount
  useEffect(() => {
    const fetchTeamMemberData = async () => {
      try {
        // Fetch team members including their IDs
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        if (data) {
          setTeamMemberOptions(data);
        }
      } catch (err) {
        console.error('Error in fetchTeamMemberData:', err);
      }
    };

    if (open) {
      fetchTeamMemberData();
    }
  }, [open]);

  // Only initialize form values when modal opens or project changes
  useEffect(() => {
    if (open && currentProject && !initialized) {
      // Find the assigned PM's ID based on name if we have team member data
      let pmId = currentProject?.assignedPM || "";
      
      // If we have team member options and the current project has an assigned PM name
      if (teamMemberOptions.length > 0 && currentProject.assignedPM) {
        // Try to find the team member by name
        const teamMember = teamMemberOptions.find(tm => tm.name === currentProject.assignedPM);
        if (teamMember) {
          pmId = teamMember.id;
        }
      }

      form.reset({
        projectName: projectName,
        clientName: currentProject?.clientName || "",
        jiraId: currentProject?.jiraId || "",
        projectType: (currentProject?.projectType as any) || "Service",
        projectStatus: (currentProject?.projectStatus as any) || "Active",
        assignedPM: pmId,
      });
      setInitialized(true);
    } else if (!open) {
      // Reset initialization flag when modal closes
      setInitialized(false);
    }
  }, [open, currentProject, form, projectName, initialized, teamMemberOptions]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Ensure we have the correct data types before sending to API
      const updateData = {
        projectName: values.projectName,
        clientName: values.clientName || "",
        jiraId: values.jiraId || "",
        projectType: values.projectType || "Service",
        projectStatus: values.projectStatus || "Active",
        // Pass the UUID directly from the form - this will be a UUID string
        assignedPM: values.assignedPM || null,
      };
      
      console.log("Submitting update with data:", updateData);
      
      // Pass the correct data structure to updateProjectDetails
      const result = await updateProjectDetails(projectName, updateData);
      
      if (result) {
        toast({
          title: "Project Updated",
          description: `${values.projectName} has been updated successfully.`,
        });
        
        // Refresh projects data after successful update
        await loadProjects();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the project.",
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
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jiraId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JIRA ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="PRJ-123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedPM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned PM</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMemberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Updating..." : "Update Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
