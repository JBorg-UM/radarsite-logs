
export interface GeneratorData {
  temperature: number | null;
  fuelLevel: number | null;
  hoursRun: number | null;
}

export interface LogEntryData {
  temperature: number | null;
  radarChannel: 'A' | 'B' | '';
  acUnitRunning: 'A' | 'B' | '';
  rcpmChannel: 'A' | 'B' | '';
  loggingRunning: boolean;
  radiationOn: boolean;
  upsBatteryPercentage: number | null;
  generator1Temperature: number | null;
  generator1FuelLevel: number | null;
  generator1HoursRun: number | null;
  generator2Temperature: number | null;
  generator2FuelLevel: number | null;
  generator2HoursRun: number | null;
  remarks: string;
}

export interface FullLogEntry extends LogEntryData {
  siteId: string; 
  date: string; // YYYY-MM-DD
  timestamp: number; // Unix timestamp (ms)
  userId: string; // ID of user who logged
}
