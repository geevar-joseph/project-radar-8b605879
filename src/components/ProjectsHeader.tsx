
import { Button } from "@/components/ui/button";

interface ProjectsHeaderProps {
  onAddProject: () => void;
}

export function ProjectsHeader({ onAddProject }: ProjectsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all projects in one place
        </p>
      </div>
      <Button onClick={onAddProject}>Add New Project</Button>
    </div>
  );
}
