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
import { useI18n } from "@/lib/i18n";

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

    // Persist to localStorage so CAPA can prefetch from submitted incidents (demo only)
    try {
      if (typeof window !== "undefined") {
        const list = JSON.parse(localStorage.getItem("incidents") || "[]");
        const id = `INC-${Date.now()}`;
        list.push({
          id,
          createdAt: new Date().toISOString(),
          ...values,
          dateISO: values.date?.toISOString(),
        });
        localStorage.setItem("incidents", JSON.stringify(list));
      }
    } catch {
      // ignore storage errors in demo
    }

    toast("Incident report saved (demo)");
    form.reset();
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
                        <SelectItem value="plant-a">{t("site_plant_a")}</SelectItem>
                        <SelectItem value="plant-b">{t("site_plant_b")}</SelectItem>
                        <SelectItem value="warehouse">{t("site_warehouse")}</SelectItem>
                        <SelectItem value="office">{t("site_office")}</SelectItem>
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
                        <SelectItem value="production">{t("area_production")}</SelectItem>
                        <SelectItem value="maintenance">{t("area_maintenance")}</SelectItem>
                        <SelectItem value="warehouse">{t("area_warehouse")}</SelectItem>
                        <SelectItem value="office">{t("area_office")}</SelectItem>
                        <SelectItem value="outdoors">{t("area_outdoors")}</SelectItem>
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
                        <SelectItem value="near-miss">{t("cat_near_miss")}</SelectItem>
                        <SelectItem value="first-aid">{t("cat_first_aid")}</SelectItem>
                        <SelectItem value="medical">{t("cat_medical")}</SelectItem>
                        <SelectItem value="lost-time">{t("cat_lost_time")}</SelectItem>
                        <SelectItem value="property">{t("cat_property_damage")}</SelectItem>
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
                        <SelectItem value="morning">{t("shift_morning")}</SelectItem>
                        <SelectItem value="afternoon">{t("shift_afternoon")}</SelectItem>
                        <SelectItem value="night">{t("shift_night")}</SelectItem>
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
                        <SelectItem value="low">{t("severity_low")}</SelectItem>
                        <SelectItem value="medium">{t("severity_medium")}</SelectItem>
                        <SelectItem value="high">{t("severity_high")}</SelectItem>
                        <SelectItem value="critical">{t("severity_critical")}</SelectItem>
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
                        <SelectItem value="empleado">{t("person_employee")}</SelectItem>
                        <SelectItem value="contratista">{t("person_contractor")}</SelectItem>
                        <SelectItem value="visitante">{t("person_visitor")}</SelectItem>
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
                        <SelectItem value="head">{t("inj_head")}</SelectItem>
                        <SelectItem value="hand">{t("inj_hand")}</SelectItem>
                        <SelectItem value="arm">{t("inj_arm")}</SelectItem>
                        <SelectItem value="leg">{t("inj_leg")}</SelectItem>
                        <SelectItem value="back">{t("inj_back")}</SelectItem>
                        <SelectItem value="other">{t("inj_other")}</SelectItem>
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
                        <SelectItem value="mechanical">{t("op_mechanical")}</SelectItem>
                        <SelectItem value="electrical">{t("op_electrical")}</SelectItem>
                        <SelectItem value="chemical">{t("op_chemical")}</SelectItem>
                        <SelectItem value="ergonomic">{t("op_ergonomic")}</SelectItem>
                        <SelectItem value="safety">{t("op_safety")}</SelectItem>
                        <SelectItem value="environmental">{t("op_environmental")}</SelectItem>
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
            <Button type="submit" className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">
              {t("ri_submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>{t("ri_reset")}</Button>
            <Button type="button" variant="outline" onClick={() => setRiskOpen(true)} className="border-[#78C151] text-[#0F2750] hover:bg-[#78C151]/10">
              {t("ri_risk_calc")}
            </Button>
          </div>
        </form>
      </Form>

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
