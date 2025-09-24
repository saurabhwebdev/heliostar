"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResponseFormValues {
  area: string;
  categoria: string;
  responsible: string;
  dueDate: Date | undefined;
  response: string;
  escalation: string;
}

export default function IASResponsePage() {
  const { t } = useI18n();
  const router = useRouter();
  const form = useForm<ResponseFormValues>({
    defaultValues: {
      area: "",
      categoria: "",
      responsible: "",
      dueDate: undefined,
      response: "",
      escalation: "",
    },
  });
  const [openDate, setOpenDate] = useState(false);

  function onSubmit(values: ResponseFormValues) {
    void values;
    toast(t("toast_response_saved"));
    router.push("/dashboard/ias");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("ias_title")}</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/ias">{t("nav_go_dashboard")}</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {/* Area and Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_area")}</div>
                  <div className="border rounded-b-md p-3">
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_find_items")} /></SelectTrigger>
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
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_category")}</div>
                  <div className="border rounded-b-md p-3">
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_find_items")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="behavior">{t("cat_behavior")}</SelectItem>
                          <SelectItem value="condition">{t("cat_condition")}</SelectItem>
                          <SelectItem value="process">{t("cat_process")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Responsible and Due Date */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_responsible")}</div>
                  <div className="border rounded-b-md p-3">
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_find_items")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supervisor">{t("role_supervisor")}</SelectItem>
                          <SelectItem value="manager">{t("role_manager")}</SelectItem>
                          <SelectItem value="hse">{t("role_hse")}</SelectItem>
                          <SelectItem value="operator">{t("role_operator")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_due_date")}</div>
                  <div className="border rounded-b-md p-3">
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
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Response */}
          <FormField
            control={form.control}
            name="response"
            render={({ field }) => (
              <FormItem>
                <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_response")}</div>
                <div className="border rounded-b-md p-3">
                  <FormControl>
                    <Textarea rows={6} placeholder={t("placeholder_enter_response")} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Escalation and Submit */}
          <div className="grid gap-4 md:grid-cols-2 items-end">
            <FormField
              control={form.control}
              name="escalation"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-[#0F2750] text-white rounded-t-md px-3 py-2 text-sm font-semibold">{t("ias_escalation")}</div>
                  <div className="border rounded-b-md p-3">
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("placeholder_find_items")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("esc_none")}</SelectItem>
                          <SelectItem value="low">{t("esc_low")}</SelectItem>
                          <SelectItem value="medium">{t("esc_medium")}</SelectItem>
                          <SelectItem value="high">{t("esc_high")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex md:justify-start">
              <Button type="submit" className="bg-[#0F2750] text-white hover:bg-[#0F2750]/90">{t("ias_submit")}</Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
