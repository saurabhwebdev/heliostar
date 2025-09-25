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

type Option = { value: string; label: string };

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

type IncidentDto = {
  id: string;
  site: string;
  occurredAt: string;
  incidentArea: string;
  incidentCategory: string;
  shift: string;
  severity: string;
  personnelType: string;
  operationalCategory: string;
  reporterName?: string | null;
  reporterUsername?: string | null;
}

export default function CAPAPage() {
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; username: string; name: string | null }>>([]);
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [openDate, setOpenDate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [incRes, userRes, optRes] = await Promise.all([
          fetch("/api/incidents?limit=50", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
          fetch(`/api/lookups?types=${encodeURIComponent([
            "site",
            "incidentArea",
            "incidentCategory",
            "shift",
            "severity",
            "personnelType",
            "operationalCategory",
            "currency",
          ].join(","))}`, { credentials: "include" }),
        ]);
        const incData = await incRes.json();
        const incidentsList: IncidentDto[] = (incData.items || []).map((it: any) => ({
          id: it.id,
          site: it.site,
          occurredAt: it.occurredAt,
          incidentArea: it.incidentArea,
          incidentCategory: it.incidentCategory,
          shift: it.shift,
          severity: it.severity,
          personnelType: it.personnelType,
          operationalCategory: it.operationalCategory,
          reporterName: it.reporter?.name ?? null,
          reporterUsername: it.reporter?.username ?? null,
        }));
        setIncidents(incidentsList);
        const userData = await userRes.json();
        setUsers(userData.items || []);
        const optData = await optRes.json();
        const mapped: Record<string, Option[]> = {};
        for (const key of Object.keys(optData.items || {})) {
          mapped[key] = (optData.items[key] as any[]).map((x) => ({ value: x.value, label: x.label }));
        }
        setOptions(mapped);
      } catch {
        setIncidents([]);
        setUsers([]);
        setOptions({});
      }
    })();
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
    const d = new Date(inc.occurredAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    form.reset({
      incidentId: id,
      site: inc.site || "",
      date: d,
      time: `${hh}:${mm}`,
      incidentArea: inc.incidentArea || "",
      incidentCategory: inc.incidentCategory || "",
      shift: inc.shift || "",
      severidad: inc.severity || "",
      tipoPersonal: inc.personnelType || "",
      categoriaOperativa: inc.operationalCategory || "",
      assignedTo: "",
      costAmount: "",
      costCurrency: options.currency?.[0]?.value || "USD",
      description: "",
      actionTaken: "",
    });
    toast("Incident data prefetched");
  }

  async function onSubmit(values: CAPAFormValues) {
    if (!values.incidentId) {
      toast("Select an incident");
      return;
    }
    try {
      const payload = {
        incidentId: values.incidentId,
        assignedToId: values.assignedTo || null,
        costAmount: values.costAmount ? Number(values.costAmount) : null,
        costCurrency: values.costCurrency || null,
        description: values.description,
        actionTaken: values.actionTaken,
      };
      const res = await fetch("/api/capa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Failed to save CAPA");
        return;
      }
      toast("CAPA saved");
      form.reset();
    } catch {
      toast("Failed to save CAPA");
    }
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
                    <SelectTrigger className="w-full text-left whitespace-normal">
                      <SelectValue placeholder={incidents.length ? "Select incident" : "No incidents yet"} />
                    </SelectTrigger>
                    <SelectContent className="min-w-[520px]">
                      {incidents.length === 0 ? (
                        <SelectGroup>
                          <SelectLabel>No incidents available</SelectLabel>
                        </SelectGroup>
                      ) : (
                        incidents.map((inc) => {
                          const dt = new Date(inc.occurredAt);
                          const dateStr = dt.toLocaleDateString();
                          const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const reporter = inc.reporterName || inc.reporterUsername || '';
                          return (
                            <SelectItem key={inc.id} value={inc.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{inc.site} • {inc.incidentCategory} • {dateStr} {timeStr}</span>
                                <span className="text-xs text-muted-foreground">Area: {inc.incidentArea} • Shift: {inc.shift} • Severity: {inc.severity}{reporter ? ` • Reporter: ${reporter}` : ''}</span>
                              </div>
                            </SelectItem>
                          );
                        })
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
                            {(options.site || []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
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
                        {(options.incidentArea || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                        {(options.incidentCategory || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                        {(options.shift || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                        {(options.severity || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                        {(options.personnelType || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                        {(options.operationalCategory || []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        {(options.currency || []).map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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
