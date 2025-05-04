
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, PieChart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Project Radar</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An internal project performance tracking tool to help leadership quickly understand project health and identify issues.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                View Dashboard
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/submit-report">
                Submit Report
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Standardized Reporting</h3>
            <p className="text-muted-foreground">
              Collect consistent monthly project health updates from all project managers.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual Dashboard</h3>
            <p className="text-muted-foreground">
              See key project metrics at a glance with clear visualizations and indicators.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Data Entry</h3>
            <p className="text-muted-foreground">
              Quickly submit reports with straightforward forms and dropdowns - no complex data entry.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Begin tracking your project performance with our simple, lightweight reporting system.
          </p>
          <Button size="lg" asChild>
            <Link to="/submit-report">
              Submit Your First Report
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
