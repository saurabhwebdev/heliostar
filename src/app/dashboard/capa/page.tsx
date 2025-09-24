"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

interface IncidentRecord {
  id: string;
  site: string;
  date?: Date;
  dateISO?: string;
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

interface CAPAFormValues {
  incidentId: string;
  site: string;
  date: Date | undefined;
  time: string;
  incidentArea: string;
  incidentCategory: string;
  shift: string;
  severidad: string;
  tipoPersonal: string;
  categoriaOperativa: string;
  assignedTo: string;
  costAmount: string;
  costCurrency: string;
  description: string;
  actionTaken: string;
}

const currencies = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "MXN", label: "MXN ($)" },
  { code: "INR", label: "INR (₹)" },
  { code: "GBP", label: "GBP (£)" },
];

export default function CAPAPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [openDate, setOpenDate] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const list = JSON.parse(localStorage.getItem("incidents") || "[]");
        const normalized: IncidentRecord[] = (list || []).map((it: Partial<IncidentRecord> & { date?: string; dateISO?: string }) => ({
          ...(it as IncidentRecord),
          date: it.date ? new Date(it.date) : it.dateISO ? new Date(it.dateISO) : undefined,
        }));
        setIncidents(normalized);
      }
    } catch {
      setIncidents([]);
    }
  }, []);

  const form = useForm<CAPAFormValues>({
    defaultValues: {
      incidentId: "",
      site: "",
      date: undefined,
      time: "",
      incidentArea: "",
      incidentCategory: "",
      shift: "",
      severidad: "",
      tipoPersonal: "",
      categoriaOperativa: "",
      assignedTo: "",
      costAmount: "",
      costCurrency: "USD",
      description: "",
      actionTaken: "",
    },
  });

  function prefillFromIncident(id: string) {
    const inc = incidents.find((x) => x.id === id);
    if (!inc) return;
    form.reset({
      incidentId: id,
      site: inc.site || "",
      date: inc.date ? new Date(inc.date) : undefined,
      time: inc.time || "",
      incidentArea: inc.incidentArea || "",
      incidentCategory: inc.incidentCategory || "",
      shift: inc.shift || "",
      severidad: inc.severidad || "",
      tipoPersonal: inc.tipoPersonal || "",
      categoriaOperativa: inc.categoriaOperativa || "",
      assignedTo: "",
      costAmount: "",
      costCurrency: "USD",
      description: inc.description || "",
      actionTaken: "",
    });
    toast("Incident data prefetched");
  }

  function onSubmit(values: CAPAFormValues) {
    void values; // mark as used for linting
    toast("CAPA saved (ui-only demo)");
    // Optionally: save to localStorage("capas") for demo
    form.reset();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CAPA</h1>
          <p className="text-sm text-muted-foreground">Create corrective and preventive actions for reported incidents.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/report-incident">Go to Report Incident</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {/* Incident selector */}
          <FormField
            control={form.control}
            name="incidentId"
            rules={{ required: "Select an incident" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      prefillFromIncident(v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={incidents.length ? "Select incident" : "No incidents yet"} />
                    </SelectTrigger>
                    <SelectContent>
                      {incidents.length === 0 ? (
                        <SelectGroup>
                          <SelectLabel>No incidents available</SelectLabel>
                        </SelectGroup>
                      ) : (
                        incidents.map((inc) => (
                          <SelectItem key={inc.id} value={inc.id}>
                            {inc.id} — {inc.site || "Site"} — {inc.date ? new Date(inc.date).toLocaleDateString() : "No date"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Incident details section */}
          <div>
            <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">Incident Details</div>
            <div className="border rounded-b-md p-3">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="site"
                  rules={{ required: "Select a site" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                            <Button type="button" variant="outline" className="justify-between">
                              {field.value ? field.value.toLocaleDateString() : "Pick a date"}
                              <CalendarIcon className="size-4 opacity-60" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => {
                                field.onChange(d || undefined);
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
            </div>
          </div>

          {/* Row 2: Area, Category, Shift */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="incidentArea"
              rules={{ required: "Select incident area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Area</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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

          {/* Row 3: Severidad, Tipo de Personal, Categoria Operativa */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="severidad"
              rules={{ required: "Select Severidad" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severidad</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
              name="categoriaOperativa"
              rules={{ required: "Select Categoría Operativa" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría Operativa</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
          </div>

          {/* Row 4: Assigned To, Cost */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="assignedTo"
              rules={{ required: "Enter assignee" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Input placeholder="Name or team" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costAmount"
              rules={{ required: "Enter cost" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Cost</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Incident Description */}
          <div>
            <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">INCIDENT DESCRIPTION</div>
            <div className="border rounded-b-md p-3">
              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Enter description" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={6} placeholder="Brief description of the incident" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">ACTION TAKEN</div>
            <div className="border rounded-b-md p-3">
              <FormField
                control={form.control}
                name="actionTaken"
                rules={{ required: "Enter actions taken" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={6} placeholder="Immediate and planned actions to prevent recurrence" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">Submit CAPA</Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
