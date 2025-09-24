/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/images/logomaster.png" alt="Logo" className="h-6 w-auto" />
              <span className="sr-only">Go to dashboard</span>
            </Link>
            <Separator orientation="vertical" className="mx-2" />
          </div>
          <div className="flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Twitter"
              className="text-muted-foreground hover:text-[#78C151] hover:bg-[#78C151]/10 focus-visible:ring-[#78C151]/30"
            >
              <Link href="#">
                <Twitter className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-[#78C151] hover:bg-[#78C151]/10 focus-visible:ring-[#78C151]/30"
            >
              <Link href="#">
                <Github className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
