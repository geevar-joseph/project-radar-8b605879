
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

interface FilterDrawerProps {
  onChange: (filters: any) => void;
}

export function FilterDrawer({ onChange }: FilterDrawerProps) {
  const [filters, setFilters] = useState({
    reportingPeriods: [],
    projectTypes: [],
    projectStatuses: [],
    riskLevels: []
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      const index = updatedFilters[filterType as keyof typeof updatedFilters].indexOf(value);
      
      if (index > -1) {
        updatedFilters[filterType as keyof typeof updatedFilters].splice(index, 1);
      } else {
        updatedFilters[filterType as keyof typeof updatedFilters].push(value);
      }
      
      return updatedFilters;
    });
  };

  const handleApplyFilters = () => {
    onChange(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      reportingPeriods: [],
      projectTypes: [],
      projectStatuses: [],
      riskLevels: []
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> 
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Projects</SheetTitle>
          <SheetDescription>
            Select filters to narrow down the project list
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Project Type</h3>
            <div className="space-y-2">
              {["Service", "Product", "Internal"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={filters.projectTypes.includes(type)} 
                    onCheckedChange={() => handleFilterChange('projectTypes', type)} 
                  />
                  <Label htmlFor={`type-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Project Status</h3>
            <div className="space-y-2">
              {["Active", "Completed", "On Hold", "Cancelled"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={filters.projectStatuses.includes(status)} 
                    onCheckedChange={() => handleFilterChange('projectStatuses', status)} 
                  />
                  <Label htmlFor={`status-${status}`}>{status}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Risk Level</h3>
            <div className="space-y-2">
              {["Low", "Medium", "High", "Critical", "N.A."].map((risk) => (
                <div key={risk} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`risk-${risk}`} 
                    checked={filters.riskLevels.includes(risk)} 
                    onCheckedChange={() => handleFilterChange('riskLevels', risk)} 
                  />
                  <Label htmlFor={`risk-${risk}`}>{risk}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between sm:justify-between space-x-4">
          <Button variant="ghost" onClick={handleResetFilters}>Reset</Button>
          <div className="flex space-x-2">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
