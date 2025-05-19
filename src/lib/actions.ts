
"use server";

import { z } from "zod";
import type { FullLogEntry, LogEntryData } from "@/types";
import { insertLogEntry, closeDb } from "@/lib/db"; // Import DB functions

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

  try {
    const result = await insertLogEntry(fullLogEntry);
    // Note: closeDb() might be better handled globally or per request lifecycle,
    // but for simplicity, we'll close it after each operation here.
    // In a high-traffic app, you'd manage connections differently.
    // await closeDb(); // Potentially remove if connection pooling is implemented

    if (result.lastID) {
      return { success: true, message: "Log saved successfully to SQLite!", logId: result.lastID.toString() };
    } else {
      return { success: false, message: "Log entry was not saved to SQLite (no ID returned)." };
    }
  } catch (error) {
    console.error("Failed to save log to SQLite:", error);
    // await closeDb(); // Ensure DB is closed on error too
    let errorMessage = "An unexpected error occurred while saving the log.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, message: `Failed to save log to SQLite: ${errorMessage}` };
  }
}
