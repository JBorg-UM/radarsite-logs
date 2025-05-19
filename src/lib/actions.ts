
"use server";

import { z } from "zod";
import { queryLogs as queryLogsFlow, type QueryLogsInput, type QueryLogsOutput } from "@/ai/flows/query-logs";
import type { FullLogEntry, LogEntryData } from "@/types";

const logEntrySchema = z.object({
  temperature: z.coerce.number().nullable(),
  radarChannel: z.enum(["A", "B", ""]).default(""),
  acUnitRunning: z.enum(["A", "B", ""]).default(""),
  rcpmChannel: z.enum(["A", "B", ""]).default(""),
  loggingRunning: z.boolean().default(false),
  radiationOn: z.boolean().default(false),
  upsBatteryPercentage: z.coerce.number().min(0).max(100).nullable(),
  generator1Temperature: z.coerce.number().nullable(),
  generator1FuelLevel: z.coerce.number().min(0).max(100).nullable(),
  generator1HoursRun: z.coerce.number().min(0).nullable(),
  generator2Temperature: z.coerce.number().nullable(),
  generator2FuelLevel: z.coerce.number().min(0).max(100).nullable(),
  generator2HoursRun: z.coerce.number().min(0).nullable(),
  remarks: z.string().optional().default(""),
});

export async function saveLog(data: LogEntryData): Promise<{ success: boolean; message: string; logId?: string }> {
  const validation = logEntrySchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: "Invalid data. " + validation.error.flatten().fieldErrors };
  }

  const validatedData = validation.data;

  // In a real app, you would get siteId and userId from session/auth
  const siteId = "SITE_001"; 
  const userId = "USER_XYZ"; 
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = Date.now();

  const fullLogEntry: FullLogEntry = {
    ...validatedData,
    siteId,
    userId,
    date,
    timestamp,
  };

  // Placeholder for Firebase save operation
  console.log("Saving log to Firebase (simulated):", JSON.stringify(fullLogEntry, null, 2));
  // Example: await db.collection("sites").doc(siteId).collection("logs").doc(date).set(fullLogEntry);
  
  // Simulate successful save
  const logId = `${siteId}-${date}-${timestamp}`;
  return { success: true, message: "Log saved successfully!", logId };
}

export async function handleAiQuery(question: string): Promise<QueryLogsOutput | { error: string }> {
  if (!question.trim()) {
    return { error: "Question cannot be empty." };
  }

  try {
    const input: QueryLogsInput = { question };
    // This is where you would typically fetch relevant logs from Firebase based on the question's context
    // For now, the AI flow might be generalized or expect data to be passed differently.
    // We are calling the Genkit flow directly.
    const result = await queryLogsFlow(input);
    return result;
  } catch (error) {
    console.error("Error querying AI:", error);
    return { error: "Failed to get answer from AI. Please try again." };
  }
}
