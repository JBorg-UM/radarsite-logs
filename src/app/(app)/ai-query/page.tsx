
import { AiQueryInterface } from "@/components/ai/ai-query-interface";
import { PageHeader } from "@/components/shared/page-header";

export default function AiQueryPage() {
  return (
    <div className="container mx-auto py-8">
       <PageHeader 
        title="AI Log Analysis"
        description="Leverage AI to query and understand patterns in your operational logs."
      />
      <AiQueryInterface />
    </div>
  );
}
