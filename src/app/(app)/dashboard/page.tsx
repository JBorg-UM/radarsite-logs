
import { LogForm } from "@/components/dashboard/log-form";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title="Daily Site Log"
        description="Please fill in all relevant parameters for today's site operations."
      />
      <LogForm />
    </div>
  );
}
