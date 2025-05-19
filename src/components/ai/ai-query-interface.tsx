
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { handleAiQuery } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2, Sparkles } from "lucide-react";

const aiQuerySchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters." }),
});

type AiQueryFormValues = z.infer<typeof aiQuerySchema>;

export function AiQueryInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AiQueryFormValues>({
    resolver: zodResolver(aiQuerySchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: AiQueryFormValues) {
    setIsLoading(true);
    setAiResponse(null);
    const result = await handleAiQuery(values.question);
    setIsLoading(false);

    if ("answer" in result) {
      setAiResponse(result.answer);
    } else {
      setAiResponse(null);
      toast({
        title: "AI Query Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Brain className="mr-2 h-6 w-6 text-primary" />
          AI Log Query
        </CardTitle>
        <CardDescription>
          Ask questions about historical log data. For example: &quot;What were the generator issues last month?&quot; or &quot;Show AC unit anomalies for Site X in July.&quot;
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Average UPS battery percentage last week?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Ask AI
            </Button>
          </CardFooter>
        </form>
      </Form>
      {aiResponse && (
        <CardContent className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-accent" />
            AI&apos;s Answer
          </h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 text-sm text-foreground">
            <p>{aiResponse}</p>
          </div>
        </CardContent>
      )}
      {isLoading && !aiResponse && (
         <CardContent className="mt-6 border-t pt-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">AI is thinking...</p>
         </CardContent>
      )}
    </Card>
  );
}
