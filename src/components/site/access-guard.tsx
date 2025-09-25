"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AccessGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setForbidden(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/access/check?path=${encodeURIComponent(pathname || "")}`, { credentials: "include" });
        const data = await res.json();
        if (!active) return;
        setForbidden(!data.allowed);
      } catch {
        if (!active) return;
        setForbidden(false);
      }
    })();
    return () => { active = false; };
  }, [pathname, status]);

  return (
    <AlertDialog open={forbidden}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Access denied</AlertDialogTitle>
          <AlertDialogDescription>
            You do not have access to this page. Please contact your administrator if you believe this is an error.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.push("/dashboard")}>Go to Dashboard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
