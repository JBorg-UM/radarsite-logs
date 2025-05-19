
"use server";

import { z } from "zod";
import type { FullLogEntry, LogEntryData } from "@/types";

// This variable will store the last submitted log in memory on the server.
// It will reset if the server restarts.
let lastSubmittedLog: FullLogEntry | null = null;

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

export async function saveLog(data: LogEntryData): Promise<{ success: boolean; message: string; jsonData?: string }> {
  const validation = logEntrySchema.safeParse(data);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');
    return { success: false, message: "Invalid data: " + errorMessages };
  }

  const validatedData = validation.data;

  const siteId = "SITE_001"; 
  const userId = "USER_XYZ"; 
  const date = new Date().toISOString().split('T')[0]; 
  const timestamp = Date.now();

  const fullLogEntry: FullLogEntry = {
    ...validatedData,
    siteId,
    userId,
    date,
    timestamp,
  };

  // Store the log entry in our server-side variable
  lastSubmittedLog = fullLogEntry;
  
  console.log("Log data captured in variable:", JSON.stringify(lastSubmittedLog, null, 2));

  return { 
    success: true, 
    message: "Log data captured successfully in a server-side variable.",
    jsonData: JSON.stringify(lastSubmittedLog, null, 2) // Optionally return the JSON
  };
}

// You can add a new action to retrieve the last submitted log if needed for debugging/display
export async function getLastSubmittedLog(): Promise<{ log: FullLogEntry | null }> {
  return { log: lastSubmittedLog };
}
