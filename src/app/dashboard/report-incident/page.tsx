"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

interface FormValues {
  site: string;
  date: Date | undefined;
  time: string;
  incidentArea: string;
  incidentCategory: string;
  shift: string;
  severidad: string;
  tipoPersonal: string;
  injuryArea: string;
  categoriaOperativa: string;
  description: string;
}

// Risk scoring tables
const likelihoodScore: Record<string, number> = {
  unlikely: 1,
  possible: 2,
  likely: 3,
  "very-likely": 4,
  "almost-certain": 5,
};
const resultScore: Record<string, number> = {
  "first-aid": 1,
  "medical-treatment": 2,
  "serious-lti": 3,
  disability: 4,
  fatality: 5,
  "multiple-fatalities": 6,
};
const exposureScore: Record<string, number> = {
  "hasnt-happened": 1,
  rarely: 2,
  sometimes: 3,
  often: 4,
  "very-often": 5,
  constant: 6,
};

export default function ReportIncidentPage() {
  const form = useForm<FormValues>({
    defaultValues: {
      site: "",
      date: undefined,
      time: "",
      incidentArea: "",
      incidentCategory: "",
      shift: "",
      severidad: "",
      tipoPersonal: "",
      injuryArea: "",
      categoriaOperativa: "",
      description: "",
    },
  });

  const [openDate, setOpenDate] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [likelihood, setLikelihood] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [exposure, setExposure] = useState<string>("");

  const riskScore = useMemo(() => {
    const l = likelihoodScore[likelihood] ?? 0;
    const r = resultScore[result] ?? 0;
    const e = exposureScore[exposure] ?? 0;
    return l && r && e ? l * r * e : 0;
  }, [likelihood, result, exposure]);

  const recommendation = useMemo(() => {
    if (!riskScore) return "Select all factors to calculate";
    if (riskScore <= 24) return "Low: Monitor and document";
    if (riskScore <= 60) return "Moderate: Mitigate and track actions";
    if (riskScore <= 120) return "High: Escalate and implement CAPA";
    return "Critical: Stop work, immediate action and escalation";
  }, [riskScore]);

  function onSubmit(values: FormValues) {
    if (!values.date) {
      toast("Please select the date.");
      return;
    }
    toast("Incident report saved (demo)");
    // In a real app, send values to your API
    // console.log("payload", values)
    form.reset();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Incident</h1>
        <p className="text-sm text-muted-foreground">
          Fill the form to register an incident
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {/* Row 1: Site, Date, Time */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="site"
              rules={{ required: "Select a site" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plant-a">Plant A</SelectItem>
                        <SelectItem value="plant-b">Plant B</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Popover open={openDate} onOpenChange={setOpenDate}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-between"
                        >
                          {field.value ? field.value.toLocaleDateString() : "Pick a date"}
                          <CalendarIcon className="size-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            field.onChange(d);
                            setOpenDate(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              rules={{ required: "Enter time" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Incident Area, Category, Shift */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="incidentArea"
              rules={{ required: "Select incident area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Area</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="outdoors">Outdoors</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentCategory"
              rules={{ required: "Select incident category" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="near-miss">Near Miss</SelectItem>
                        <SelectItem value="first-aid">First Aid</SelectItem>
                        <SelectItem value="medical">Medical Treatment</SelectItem>
                        <SelectItem value="lost-time">Lost Time</SelectItem>
                        <SelectItem value="property">Property Damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shift"
              rules={{ required: "Select shift" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Severidad, Tipo de Personal, Injury Area */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="severidad"
              rules={{ required: "Select Severidad" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severidad</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoPersonal"
              rules={{ required: "Select Tipo de Personal" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Personal</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="contratista">Contratista</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="injuryArea"
              rules={{ required: "Select Injury Area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Injury Area</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select body area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="head">Head</SelectItem>
                        <SelectItem value="hand">Hand</SelectItem>
                        <SelectItem value="arm">Arm</SelectItem>
                        <SelectItem value="leg">Leg</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4: Categoria Operativa & Description */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoriaOperativa"
              rules={{ required: "Select Categoría Operativa" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría Operativa</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanical">Mecánica</SelectItem>
                        <SelectItem value="electrical">Eléctrica</SelectItem>
                        <SelectItem value="chemical">Química</SelectItem>
                        <SelectItem value="ergonomic">Ergonómica</SelectItem>
                        <SelectItem value="safety">Seguridad</SelectItem>
                        <SelectItem value="environmental">Ambiental</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Enter description" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what happened, who was involved, and any immediate actions taken"
                      value={field.value}
                      onChange={field.onChange}
                      rows={6}
                    />
                  </FormControl>
                  <div className="flex justify-end text-xs text-muted-foreground">
                    {field.value?.length ?? 0}/1000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">
              Submit Report
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
            <Button type="button" variant="outline" onClick={() => setRiskOpen(true)} className="border-[#78C151] text-[#0F2750] hover:bg-[#78C151]/10">
              Risk Calculator
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={riskOpen} onOpenChange={setRiskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Risk Calculator</DialogTitle>
            <DialogDescription>Select the factors to estimate risk.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Likelihood</Label>
              <Select value={likelihood} onValueChange={setLikelihood}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlikely">Unlikely</SelectItem>
                  <SelectItem value="possible">Possible</SelectItem>
                  <SelectItem value="likely">Likely</SelectItem>
                  <SelectItem value="very-likely">Very likely</SelectItem>
                  <SelectItem value="almost-certain">Almost certain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Result</Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-aid">First Aid</SelectItem>
                  <SelectItem value="medical-treatment">Medical treatment</SelectItem>
                  <SelectItem value="serious-lti">Serious (LTI)</SelectItem>
                  <SelectItem value="disability">Disability</SelectItem>
                  <SelectItem value="fatality">Fatality</SelectItem>
                  <SelectItem value="multiple-fatalities">Multiple Fatalities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Exposure</Label>
              <Select value={exposure} onValueChange={setExposure}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hasnt-happened">Hasn’t Happened</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="often">Often</SelectItem>
                  <SelectItem value="very-often">Very often</SelectItem>
                  <SelectItem value="constant">Constant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Computed Risk Score</p>
                <p className="text-2xl font-bold">{riskScore || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Recommendation</p>
                <p className="font-medium">{recommendation}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setLikelihood(""); setResult(""); setExposure(""); }}>Clear</Button>
            <Button onClick={() => setRiskOpen(false)} className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
