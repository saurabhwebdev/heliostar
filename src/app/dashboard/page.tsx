import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardPage() {
  const items = [
    { label: "Report Incident", href: "/dashboard/report-incident", desc: "Create and submit an incident report" },
    { label: "CAPA", href: "/dashboard/capa", desc: "Track corrective and preventive actions" },
    { label: "IAS", href: "/dashboard/ias", desc: "Incident analysis and audits" },
    { label: "Carpeta Supervisor", href: "/dashboard/carpeta-supervisor", desc: "Supervisor resources and files" },
    { label: "Procedimientos", href: "/dashboard/procedimientos", desc: "Procedures and SOPs" },
    { label: "Platicas 5 mins", href: "/dashboard/platicas-5-mins", desc: "Short safety talks and guidance" },
    { label: "Standard Templates", href: "/dashboard/standard-templates", desc: "Standardized templates and forms" },
    { label: "Analytics", href: "/dashboard/analytics", desc: "KPIs, trends, and dashboards" },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health and Safety Application</h1>
        <p className="text-sm text-muted-foreground">Quick access to core modules</p>
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
