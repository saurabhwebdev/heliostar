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
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Option = { value: string; label: string };
type OptionsByType = Record<string, Option[]>;

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

type IncidentItem = {
  id: string
  createdAt: string
  site: string
  incidentCategory: string
  incidentArea: string
  shift: string
  occurredAt: string
  reporter?: { username?: string | null; name?: string | null; email?: string | null } | null
}

export default function ReportIncidentPage() {
  const { t } = useI18n();
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
  const [submitting, setSubmitting] = useState(false);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [incidentsOptions, setIncidentsOptions] = useState<OptionsByType>({});

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

  async function loadIncidents() {
    try {
      const res = await fetch("/api/incidents?limit=10", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: IncidentItem[] };
      setIncidents(data.items ?? []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadIncidents();
    // Load dropdown options
    (async () => {
      try {
        const types = [
          "site",
          "incidentArea",
          "incidentCategory",
          "shift",
          "severity",
          "personnelType",
          "injuryArea",
          "operationalCategory",
        ].join(",");
        const res = await fetch(`/api/lookups?types=${encodeURIComponent(types)}`, { credentials: "include" });
        const data = await res.json();
        const grouped = data.items || {};
        const mapped: OptionsByType = {};
        for (const key of Object.keys(grouped)) {
          mapped[key] = (grouped[key] as any[]).map((it) => ({ value: it.value, label: it.label }));
        }
        setIncidentsOptions(mapped);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function onSubmit(values: FormValues) {
    if (!values.date) {
      toast("Please select the date.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const dateISO = values.date?.toISOString();
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          dateISO,
          riskScore,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Failed to save incident");
        return;
      }
      toast("Incident report saved");
      form.reset();
      setLikelihood(""); setResult(""); setExposure("");
      await loadIncidents();
    } catch (e) {
      toast("Failed to save incident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("ri_title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("ri_subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {/* Incident details section */}
          <div>
            <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ri_incident_details")}</div>
            <div className="border rounded-b-md p-3">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="site"
                  rules={{ required: "Select a site" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ri_site")}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_site")} />
                          </SelectTrigger>
                          <SelectContent>
                            {(incidentsOptions.site || []).map((o) => (
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
                      <FormLabel>{t("ri_date")}</FormLabel>
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
                      <FormLabel>{t("ri_time")}</FormLabel>
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

          {/* Row 2: Incident Area, Category, Shift */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="incidentArea"
              rules={{ required: "Select incident area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ri_incident_area")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_area")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.incidentArea || []).map((o) => (
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
                  <FormLabel>{t("ri_incident_category")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.incidentCategory || []).map((o) => (
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
                  <FormLabel>{t("ri_shift")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_shift")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.shift || []).map((o) => (
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

          {/* Row 3: Severidad, Tipo de Personal, Injury Area */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="severidad"
              rules={{ required: "Select Severidad" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ri_severity")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_severity")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.severity || []).map((o) => (
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
                  <FormLabel>{t("ri_personnel_type")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_type")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.personnelType || []).map((o) => (
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
              name="injuryArea"
              rules={{ required: "Select Injury Area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ri_injury_area")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("placeholder_select_body_area")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.injuryArea || []).map((o) => (
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

          {/* Row 4: Categoria Operativa */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoriaOperativa"
              rules={{ required: "Select Categoría Operativa" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ri_operational_category")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("placeholder_select_category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(incidentsOptions.operationalCategory || []).map((o) => (
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

          {/* Incident description section */}
          <div>
            <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ri_description_section")}</div>
            <div className="border rounded-b-md p-3">
              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Enter description" }}
                render={({ field }) => (
                  <FormItem>
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
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90" disabled={submitting}>
              {submitting ? "Saving..." : t("ri_submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>{t("ri_reset")}</Button>
            <Button type="button" variant="outline" onClick={() => setRiskOpen(true)} className="border-[#78C151] text-[#0F2750] hover:bg-[#78C151]/10">
              {t("ri_risk_calc")}
            </Button>
          </div>
        </form>
      </Form>

      {/* Recent incidents (from database) */}
      <div className="rounded-md border overflow-hidden">
        <div className="bg-muted px-3 py-2 text-sm font-semibold">Recent incidents</div>
        <div className="p-3">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents yet.</p>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">When</th>
                    <th className="text-left p-2">Site</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Area</th>
                    <th className="text-left p-2">Shift</th>
                    <th className="text-left p-2">Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((it) => (
                    <tr key={it.id} className="border-b last:border-0">
                      <td className="p-2">{new Date(it.occurredAt).toLocaleString()}</td>
                      <td className="p-2">{it.site}</td>
                      <td className="p-2">{it.incidentCategory}</td>
                      <td className="p-2">{it.incidentArea}</td>
                      <td className="p-2">{it.shift}</td>
                      <td className="p-2">{it.reporter?.name || it.reporter?.username || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={riskOpen} onOpenChange={setRiskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rc_title")}</DialogTitle>
            <DialogDescription>{t("rc_desc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("rc_likelihood")}</Label>
              <Select value={likelihood} onValueChange={setLikelihood}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlikely">{t("rc_unlikely")}</SelectItem>
                  <SelectItem value="possible">{t("rc_possible")}</SelectItem>
                  <SelectItem value="likely">{t("rc_likely")}</SelectItem>
                  <SelectItem value="very-likely">{t("rc_very_likely")}</SelectItem>
                  <SelectItem value="almost-certain">{t("rc_almost_certain")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("rc_result")}</Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-aid">{t("rc_first_aid")}</SelectItem>
                  <SelectItem value="medical-treatment">{t("rc_medical_treatment")}</SelectItem>
                  <SelectItem value="serious-lti">{t("rc_serious_lti")}</SelectItem>
                  <SelectItem value="disability">{t("rc_disability")}</SelectItem>
                  <SelectItem value="fatality">{t("rc_fatality")}</SelectItem>
                  <SelectItem value="multiple-fatalities">{t("rc_multiple_fatalities")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("rc_exposure")}</Label>
              <Select value={exposure} onValueChange={setExposure}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hasnt-happened">{t("rc_hasnt_happened")}</SelectItem>
                  <SelectItem value="rarely">{t("rc_rarely")}</SelectItem>
                  <SelectItem value="sometimes">{t("rc_sometimes")}</SelectItem>
                  <SelectItem value="often">{t("rc_often")}</SelectItem>
                  <SelectItem value="very-often">{t("rc_very_often")}</SelectItem>
                  <SelectItem value="constant">{t("rc_constant")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("rc_score")}</p>
                <p className="text-2xl font-bold">{riskScore || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t("rc_recommendation")}</p>
                <p className="font-medium">{recommendation}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setLikelihood(""); setResult(""); setExposure(""); }}>{t("rc_clear")}</Button>
            <Button onClick={() => setRiskOpen(false)} className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">{t("rc_close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
