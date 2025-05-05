
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProjectSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProjectSearchBar: React.FC<ProjectSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="mb-6 relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name or JIRA ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
    </div>
  );
};
