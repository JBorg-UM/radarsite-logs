'use server';

/**
 * @fileOverview An AI agent for querying historical log data.
 *
 * - queryLogs - A function that handles querying the logs based on a natural language question.
 * - QueryLogsInput - The input type for the queryLogs function.
 * - QueryLogsOutput - The return type for the queryLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueryLogsInputSchema = z.object({
  question: z.string().describe('A natural language question about the historical log data.'),
});
export type QueryLogsInput = z.infer<typeof QueryLogsInputSchema>;

const QueryLogsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the historical log data.'),
});
export type QueryLogsOutput = z.infer<typeof QueryLogsOutputSchema>;

export async function queryLogs(input: QueryLogsInput): Promise<QueryLogsOutput> {
  return queryLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queryLogsPrompt',
  input: {schema: QueryLogsInputSchema},
  output: {schema: QueryLogsOutputSchema},
  prompt: `You are an AI assistant that answers questions about historical log data.

  Use the provided question to query the logs and provide a concise and accurate answer.

  Question: {{{question}}}`,
});

const queryLogsFlow = ai.defineFlow(
  {
    name: 'queryLogsFlow',
    inputSchema: QueryLogsInputSchema,
    outputSchema: QueryLogsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
