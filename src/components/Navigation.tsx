
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">Project Radar</Link>
        <nav className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/submit-report">Submit Report</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
