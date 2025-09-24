"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { t } = useI18n();
  const items = [
    { label: t("mod_report_incident"), href: "/dashboard/report-incident", desc: t("tip_mod_report_incident") },
    { label: t("mod_capa"), href: "/dashboard/capa", desc: t("tip_mod_capa") },
    { label: t("mod_ias"), href: "/dashboard/ias", desc: t("tip_mod_ias") },
    { label: t("mod_carpeta"), href: "/dashboard/carpeta-supervisor", desc: t("tip_mod_carpeta") },
    { label: t("mod_procedimientos"), href: "/dashboard/procedimientos", desc: t("tip_mod_procedimientos") },
    { label: t("mod_platicas"), href: "/dashboard/platicas-5-mins", desc: t("tip_mod_platicas") },
    { label: t("mod_templates"), href: "/dashboard/standard-templates", desc: t("tip_mod_templates") },
    { label: t("mod_analytics"), href: "/dashboard/analytics", desc: t("tip_mod_analytics") },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("app_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("app_subtitle")}</p>
      </div>

      <TooltipProvider>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {items.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className="block rounded-md bg-[#78C151] text-[#0F2750] px-4 py-4 text-center font-semibold shadow-sm hover:bg-[#78C151]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2750]/30 transition-colors"
                >
                  {item.label}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-center">
                {item.desc}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
}
