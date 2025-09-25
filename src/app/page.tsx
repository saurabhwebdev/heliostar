'use client'
/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function Home() {
  const [src, setSrc] = useState("/images/pexels-pixabay-60008.jpg");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const username = String(fd.get("email") || "");
      const password = String(fd.get("password") || "");
      await signIn("credentials", {
        username,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen md:h-screen grid md:grid-cols-2">
      {/* Image panel */}
      <div className="relative h-64 md:h-auto overflow-hidden">
        <img
          src={src}
          onError={() => setSrc('/vercel.svg')}
          alt="Silver steel mining crane on rocky soil"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <img
              src="/images/logomaster.png"
              alt="Logo"
              className="mx-auto h-12 w-auto"
            />
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input id="email" name="email" type="text" placeholder="admin or user" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
