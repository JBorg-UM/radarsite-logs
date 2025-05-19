
"use server";

import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import path from 'path';
import type { FullLogEntry } from '@/types';

// Define the path to the database file
// It will be created in the project's root directory in a '.db' folder for better organization
const DB_FILE_NAME = 'site_logs.db';
const DB_DIR = path.join(process.cwd(), '.db'); 
const DB_FILE_PATH = path.join(DB_DIR, DB_FILE_NAME);

// Ensure the .db directory exists
import fs from 'fs';
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: Database | null = null;

async function initializeDb(db: Database): Promise<void> {
  console.log('Initializing database schema...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS log_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siteId TEXT NOT NULL,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      temperature REAL,
      radarChannel TEXT,
      acUnitRunning TEXT,
      rcpmChannel TEXT,
      loggingRunning INTEGER,
      radiationOn INTEGER,
      upsBatteryPercentage REAL,
      generator1Temperature REAL,
      generator1FuelLevel REAL,
      generator1HoursRun REAL,
      generator2Temperature REAL,
      generator2FuelLevel REAL,
      generator2HoursRun REAL,
      remarks TEXT
    );
  `);
  console.log('Database schema initialized.');
}

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    try {
      console.log(`Opening database at: ${DB_FILE_PATH}`);
      const db = await open({
        filename: DB_FILE_PATH,
        driver: sqlite3.Database,
      });
      await initializeDb(db);
      dbInstance = db;
      console.log('Database connection established and initialized.');
    } catch (error) {
      console.error('Failed to open or initialize database:', error);
      throw error; // Re-throw to indicate failure
    }
  }
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('Database connection closed.');
  }
}

// Example of how to insert a log, can be called from actions.ts
export async function insertLogEntry(logEntry: FullLogEntry): Promise<{lastID?: number, changes?: number}> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO log_entries (
      siteId, userId, date, timestamp, temperature, radarChannel, acUnitRunning,
      rcpmChannel, loggingRunning, radiationOn, upsBatteryPercentage,
      generator1Temperature, generator1FuelLevel, generator1HoursRun,
      generator2Temperature, generator2FuelLevel, generator2HoursRun, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    logEntry.siteId,
    logEntry.userId,
    logEntry.date,
    logEntry.timestamp,
    logEntry.temperature,
    logEntry.radarChannel,
    logEntry.acUnitRunning,
    logEntry.rcpmChannel,
    logEntry.loggingRunning ? 1 : 0,
    logEntry.radiationOn ? 1 : 0,
    logEntry.upsBatteryPercentage,
    logEntry.generator1Temperature,
    logEntry.generator1FuelLevel,
    logEntry.generator1HoursRun,
    logEntry.generator2Temperature,
    logEntry.generator2FuelLevel,
    logEntry.generator2HoursRun,
    logEntry.remarks
  );
  return { lastID: result.lastID, changes: result.changes };
}
