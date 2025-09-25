"use client";

import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

interface IASFormValues {
  date: Date | undefined;
  time: string;
  observed: string;
  weighted: string;
  peopleSafe: string;
  area: string;
  categoria: string;
  total: string;
  descripcion: string;
  comentarios: string;
}

export default function IASPage() {
  const { t } = useI18n();
  const form = useForm<IASFormValues>({
    defaultValues: {
      date: undefined,
      time: "",
      observed: "",
      weighted: "",
      peopleSafe: "",
      area: "",
      categoria: "",
      total: "",
      descripcion: "",
      comentarios: "",
    },
  });

  const [openDate, setOpenDate] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);

  // Risk assessment (same model used elsewhere)
  const [likelihood, setLikelihood] = useState("");
  const [result, setResult] = useState("");
  const [exposure, setExposure] = useState("");
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
  const riskScore = useMemo(() => {
    const l = likelihoodScore[likelihood] ?? 0;
    const r = resultScore[result] ?? 0;
    const e = exposureScore[exposure] ?? 0;
    return l && r && e ? l * r * e : 0;
  }, [likelihood, result, exposure, likelihoodScore, resultScore, exposureScore]);
  const recommendation = useMemo(() => {
    if (!riskScore) return "Select all factors to calculate";
    if (riskScore <= 24) return "Low: Monitor and document";
    if (riskScore <= 60) return "Moderate: Mitigate and track actions";
    if (riskScore <= 120) return "High: Escalate and implement CAPA";
    return "Critical: Stop work, immediate action and escalation";
  }, [riskScore]);

  function onSubmit(values: IASFormValues) {
    void values; // demo only
    toast(t("toast_ias_saved"));
    form.reset();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
<h1 className="text-2xl font-bold">{t("ias_title")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main form */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              {/* Date row */}
              <div>
<div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_date")}</div>
                <div className="grid gap-4 md:grid-cols-3 border rounded-b-md p-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
<FormLabel>{t("ias_date")}</FormLabel>
                        <FormControl>
                          <Popover open={openDate} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" className="justify-between">
{field.value ? field.value.toLocaleDateString() : t("placeholder_pick_date")}
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
                    render={({ field }) => (
                      <FormItem>
<FormLabel>{t("ias_time")}</FormLabel>
                        <FormControl>
                          <Input type="time" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="hidden md:block" />
                </div>
              </div>

              {/* Observed/Weighted/People safe */}
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="observed"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_observed")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
<SelectValue placeholder={t("placeholder_find_items")} />
                          </SelectTrigger>
                          <SelectContent>
<SelectItem value="workers">{t("obs_workers")}</SelectItem>
<SelectItem value="equipment">{t("obs_equipment")}</SelectItem>
<SelectItem value="environment">{t("obs_environment")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weighted"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_weighted")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Find items" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peopleSafe"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_people_safe")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Area/Categoría/Total */}
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_area")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Find items" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
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
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_category")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Find items" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="behavior">Behavior</SelectItem>
                            <SelectItem value="condition">Condition</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
<FormLabel>{t("ias_total")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">DESCRIPCIÓN DE LA CONDUCTA INSEGURA</div>
                <div className="border rounded-b-md p-3">
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={5} placeholder={t("placeholder_unsafe_desc")} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">COMENTARIOS</div>
                <div className="border rounded-b-md p-3">
                  <FormField
                    control={form.control}
                    name="comentarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={4} placeholder={t("placeholder_additional_comments")} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" className="bg-[#78C151] text-[#0F2750] hover:bg-[#78C151]/90">{t("ias_submit")}</Button>
                <Button type="button" variant="outline" onClick={() => form.reset()}>{t("ias_reset")}</Button>
                <Button asChild type="button" variant="outline"><Link href="/dashboard/ias/response">{t("ias_response")}</Link></Button>
                <Button type="button" variant="outline" onClick={() => setRiskOpen(true)} className="border-[#78C151] hover:bg-[#78C151]/10">{t("ias_risk_assessment")}</Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Legend */}
        <aside className="lg:col-span-1">
          <div className="rounded-md border overflow-hidden">
            <div className="bg-[#0F2750] text-white px-3 py-2 text-sm font-semibold">{t("ias_legend")}</div>
            <div className="p-3 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="inline-block size-3 rounded-full bg-green-500" /> ≥95 <span className="text-muted-foreground">{t("ias_safe")}</span></div>
              <div className="flex items-center gap-2"><span className="inline-block size-3 rounded-full bg-yellow-500" /> &lt;95 ≥90 <span className="text-muted-foreground">{t("ias_warning")}</span></div>
              <div className="flex items-center gap-2"><span className="inline-block size-3 rounded-full bg-orange-500" /> &lt;90 <span className="text-muted-foreground">{t("ias_risk")}</span></div>
            </div>
          </div>
        </aside>
      </div>


      {/* Risk assessment dialog */}
      <Dialog open={riskOpen} onOpenChange={setRiskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ias_risk_assessment")}</DialogTitle>
            <DialogDescription>{t("rc_desc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("rc_likelihood")}</Label>
              <Select value={likelihood} onValueChange={setLikelihood}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_select")} /></SelectTrigger>
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
                <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_select")} /></SelectTrigger>
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
                <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_select")} /></SelectTrigger>
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
