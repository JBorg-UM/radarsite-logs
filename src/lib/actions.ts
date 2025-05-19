
"use server";

import { z } from "zod";
// Removed AI-related imports: queryLogsFlow, QueryLogsInput, QueryLogsOutput
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
    // Improved error message for Zod validation
    const fieldErrors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');
    return { success: false, message: "Invalid data: " + errorMessages };
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

  // Placeholder for Firebase save operation (or your future MySQL save)
  console.log("Saving log (simulated):", JSON.stringify(fullLogEntry, null, 2));
  // Example: await db.collection("sites").doc(siteId).collection("logs").doc(date).set(fullLogEntry);
  
  // Simulate successful save
  const logId = `${siteId}-${date}-${timestamp}`;
  return { success: true, message: "Log saved successfully!", logId };
}

// Removed handleAiQuery function
