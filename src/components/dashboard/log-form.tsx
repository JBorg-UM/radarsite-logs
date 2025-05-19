
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { saveLog } from "@/lib/actions";
import type { LogEntryData } from "@/types";
import { Thermometer, RadioReceiver, AirVent, Router, ClipboardList, Radiation, BatteryCharging, Zap, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";

const logFormSchema = z.object({
  temperature: z.coerce.number({ invalid_type_error: "Must be a number" }).nullable().optional(),
  radarChannel: z.enum(["A", "B", ""], { errorMap: () => ({ message: "Select a Radar Channel" }) }).default(""),
  acUnitRunning: z.enum(["A", "B", ""], { errorMap: () => ({ message: "Select AC Unit status" }) }).default(""),
  rcpmChannel: z.enum(["A", "B", ""], { errorMap: () => ({ message: "Select RCPM Channel" }) }).default(""),
  loggingRunning: z.boolean().default(false),
  radiationOn: z.boolean().default(false),
  upsBatteryPercentage: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).max(100).nullable().optional(),
  
  generator1Temperature: z.coerce.number({ invalid_type_error: "Must be a number" }).nullable().optional(),
  generator1FuelLevel: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).max(100).nullable().optional(),
  generator1HoursRun: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).nullable().optional(),
  
  generator2Temperature: z.coerce.number({ invalid_type_error: "Must be a number" }).nullable().optional(),
  generator2FuelLevel: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).max(100).nullable().optional(),
  generator2HoursRun: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).nullable().optional(),
  
  remarks: z.string().max(500, "Remarks too long").optional().default(""),
});

type LogFormValues = z.infer<typeof logFormSchema>;

const defaultValues: Partial<LogFormValues> = {
  temperature: null,
  radarChannel: "",
  acUnitRunning: "",
  rcpmChannel: "",
  loggingRunning: false,
  radiationOn: false,
  upsBatteryPercentage: null,
  generator1Temperature: null,
  generator1FuelLevel: null,
  generator1HoursRun: null,
  generator2Temperature: null,
  generator2FuelLevel: null,
  generator2HoursRun: null,
  remarks: "",
};

export function LogForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues,
  });

  async function onSubmit(data: LogFormValues) {
    setIsSubmitting(true);
    const dataToSave: LogEntryData = {
        ...data,
        // Ensure null for empty strings converted by coerce.number if needed,
        // or handle coercion properly. Zod coerce turns "" to 0 for numbers.
        // For nullable numbers, ensure empty input results in null not 0 if that's desired.
        // Current schema with .nullable().optional() means if field is empty, it's undefined.
        // We'll ensure they are null if not provided or empty.
        temperature: data.temperature === undefined ? null : data.temperature,
        upsBatteryPercentage: data.upsBatteryPercentage === undefined ? null : data.upsBatteryPercentage,
        generator1Temperature: data.generator1Temperature === undefined ? null : data.generator1Temperature,
        generator1FuelLevel: data.generator1FuelLevel === undefined ? null : data.generator1FuelLevel,
        generator1HoursRun: data.generator1HoursRun === undefined ? null : data.generator1HoursRun,
        generator2Temperature: data.generator2Temperature === undefined ? null : data.generator2Temperature,
        generator2FuelLevel: data.generator2FuelLevel === undefined ? null : data.generator2FuelLevel,
        generator2HoursRun: data.generator2HoursRun === undefined ? null : data.generator2HoursRun,
    };
    
    const result = await saveLog(dataToSave);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Log Saved",
        description: result.message,
      });
      form.reset(defaultValues); // Reset form to default values
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }
  
  const renderSelectField = (name: keyof LogFormValues, label: string, icon: React.ElementType, placeholder: string, options: {value: string, label: string}[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 min-w-[200px]">
          <FormLabel className="flex items-center"><icon className="mr-2 h-4 w-4 text-muted-foreground" />{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value as string || ""} value={field.value as string || ""}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderNumericField = (name: keyof LogFormValues, label: string, icon: React.ElementType, placeholder: string, unit?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 min-w-[150px]">
          <FormLabel className="flex items-center"><icon className="mr-2 h-4 w-4 text-muted-foreground" />{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                placeholder={placeholder} 
                {...field} 
                value={field.value === null || field.value === undefined ? "" : String(field.value)}
                onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                className={unit ? "pr-10" : ""}
              />
              {unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">{unit}</span>}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const renderCheckboxField = (name: keyof LogFormValues, label: string, icon: React.ElementType) => (
     <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <icon className="h-5 w-5 text-muted-foreground" />
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{label}</FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Site Parameters</CardTitle>
            <CardDescription>Log the current operational parameters for the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6">
              {renderNumericField("temperature" as keyof LogFormValues, "Site Temperature", Thermometer, "e.g., 25", "°C")}
              {renderNumericField("upsBatteryPercentage" as keyof LogFormValues, "UPS Battery", BatteryCharging, "e.g., 95", "%")}
            </div>
            <div className="flex flex-wrap gap-6">
              {renderSelectField("radarChannel" as keyof LogFormValues, "Radar Channel", RadioReceiver, "Select Channel", [{value: "A", label: "Option A"}, {value: "B", label: "Option B"}])}
              {renderSelectField("acUnitRunning" as keyof LogFormValues, "AC Unit Running", AirVent, "Select AC Unit", [{value: "A", label: "Unit A"}, {value: "B", label: "Unit B"}])}
              {renderSelectField("rcpmChannel" as keyof LogFormValues, "RCPM Channel", Router, "Select Channel", [{value: "A", label: "Option A"}, {value: "B", label: "Option B"}])}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {renderCheckboxField("loggingRunning" as keyof LogFormValues, "Logging System Active", ClipboardList)}
                {renderCheckboxField("radiationOn" as keyof LogFormValues, "Radiation On", Radiation)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(genNum => (
            <Card key={genNum} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="mr-2 h-5 w-5 text-primary" /> Generator {genNum}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderNumericField(`generator${genNum}Temperature` as keyof LogFormValues, "Temperature", Thermometer, "e.g., 60", "°C")}
                {renderNumericField(`generator${genNum}FuelLevel` as keyof LogFormValues, "Fuel Level", BatteryCharging, "e.g., 75", "%")}
                {renderNumericField(`generator${genNum}HoursRun` as keyof LogFormValues, "Hours Run", ClipboardList, "e.g., 1250", "hrs")}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Remarks</CardTitle>
            <CardDescription>Note any observations or anomalies.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Enter remarks here..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Log
        </Button>
      </form>
    </Form>
  );
}
