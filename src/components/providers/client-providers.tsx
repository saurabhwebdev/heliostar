"use client";

import React from "react";
import { I18nProvider } from "@/lib/i18n";
import { SessionProvider } from "next-auth/react";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>{children}</I18nProvider>
    </SessionProvider>
  );
}
