
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const ProjectTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>JIRA ID</TableHead>
        <TableHead>Project Name</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Assigned PM</TableHead>
        <TableHead>Project Type</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Overall Score</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
