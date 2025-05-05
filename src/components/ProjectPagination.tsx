
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from "@/components/ui/pagination";

interface ProjectPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export const ProjectPagination: React.FC<ProjectPaginationProps> = ({ 
  currentPage, 
  pageCount, 
  onPageChange 
}) => {
  if (pageCount <= 1) return null;

  return (
    <div className="py-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: pageCount }).map((_, i) => {
            const pageNumber = i + 1;
            // Display first page, last page, current page and pages around current
            if (
              pageNumber === 1 || 
              pageNumber === pageCount || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) || 
              (pageNumber === currentPage + 2 && currentPage < pageCount - 2)
            ) {
              // Add ellipsis for skipped pages
              return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(currentPage + 1, pageCount))}
              className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
