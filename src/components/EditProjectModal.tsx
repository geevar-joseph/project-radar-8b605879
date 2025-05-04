
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
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/components/ui/use-toast";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

const formSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  clientName: z.string().optional(),
  projectType: z.string().optional(),
  projectStatus: z.string().optional(),
  assignedPM: z.string().optional(),
});

export const EditProjectModal = ({ open, onOpenChange, projectName }: EditProjectModalProps) => {
  const { updateProjectDetails, projects, teamMembers } = useProjectContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the current project data
  const currentProject = projects.find(p => 
    p.projectName === projectName || p.project_name === projectName
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: projectName,
      clientName: currentProject?.clientName || currentProject?.client_name || "",
      projectType: currentProject?.projectType || currentProject?.project_type || "",
      projectStatus: currentProject?.projectStatus || currentProject?.project_status || "",
      assignedPM: currentProject?.assignedPM || currentProject?.assigned_pm || "",
    },
  });

  // Update form values when project changes
  useEffect(() => {
    if (currentProject) {
      form.reset({
        projectName: projectName,
        clientName: currentProject?.clientName || currentProject?.client_name || "",
        projectType: currentProject?.projectType || currentProject?.project_type || "",
        projectStatus: currentProject?.projectStatus || currentProject?.project_status || "",
        assignedPM: currentProject?.assignedPM || currentProject?.assigned_pm || "",
      });
    }
  }, [currentProject, form, projectName]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await updateProjectDetails(projectName, values);
      toast({
        title: "Project Updated",
        description: `${values.projectName} has been updated successfully.`,
      });
      onOpenChange(false);
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
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input {...field} list="teamMembers" />
                  </FormControl>
                  <datalist id="teamMembers">
                    {teamMembers.map((member) => (
                      <option key={member} value={member} />
                    ))}
                  </datalist>
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
