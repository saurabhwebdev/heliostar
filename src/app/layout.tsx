import type { Metadata } from "next";
import { Nunito_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Heliostar",
    template: "%s | Heliostar",
  },
  description: "Heliostar — Health & Safety Application",
  applicationName: "Heliostar H&S",
  keywords: [
    "heliostar",
    "health",
    "safety",
    "H&S",
    "EHS",
    "incident",
    "CAPA",
    "IAS",
  ],
  themeColor: "#78C151",
  icons: {
    icon: "/images/tablogo.png",
    shortcut: "/images/tablogo.png",
    apple: "/images/tablogo.png",
  },
  openGraph: {
    title: "Heliostar",
    description: "Heliostar — Health & Safety Application",
    siteName: "Heliostar",
    images: [
      {
        url: "/images/tablogo.png",
        width: 256,
        height: 256,
        alt: "Heliostar",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Heliostar",
    description: "Heliostar — Health & Safety Application",
    images: ["/images/tablogo.png"],
  },
};

import ClientProviders from "@/components/providers/client-providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunitoSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
