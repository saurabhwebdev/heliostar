"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SiteHeader() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Brand logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/images/logomaster.png" alt="Logo" className="h-7 w-auto" />
          <span className="sr-only">{t("nav_go_dashboard")}</span>
        </Link>


        <div className="flex items-center gap-3">
          {/* Language selector */}
          <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <SelectTrigger size="sm" className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>

          {/* Profile dropdown */}
          <DropdownMenu>
          <DropdownMenuTrigger className="outline-hidden">
            <Avatar className="ring-2 ring-[#78C151]/50 ring-offset-2 ring-offset-background hover:ring-[#78C151] transition-colors">
              <AvatarImage src="https://api.dicebear.com/8.x/micah/svg?seed=Saurabh%20Thakur" alt="Profile" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{ "--accent": "#78C151", "--accent-foreground": "#000000" } as React.CSSProperties}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">Saurabh</span>
                <span className="text-xs text-muted-foreground">user@example.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="hover:bg-[#78C151]/10 focus:bg-[#78C151]/20 focus:text-black">
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <User className="size-4" /> {t("nav_profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#78C151]/10 hover:text-black focus:bg-[#78C151]/20 focus:text-black"
              onSelect={() => toast(t("nav_settings_coming")) }
            >
              <Settings className="size-4" /> {t("nav_settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:bg-[#78C151]/10 hover:text-black focus:bg-[#78C151]/20 focus:text-black"
              onSelect={() => {
                toast(t("nav_signed_out"));
                router.push("/");
              }}
            >
              <LogOut className="size-4" /> {t("nav_logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
