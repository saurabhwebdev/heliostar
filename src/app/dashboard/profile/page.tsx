import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return (
      <section>
        <p className="text-sm text-muted-foreground">No user session.</p>
      </section>
    );
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const displayName = user?.name || user?.username || "User";
  const displayEmail = user?.email || "";
  const initials = (displayName || "U").split(/\s+/).map(s => s[0]).join("").slice(0,2).toUpperCase();
  const avatarSrc = user?.image || (user?.username ? `https://api.dicebear.com/8.x/micah/svg?seed=${encodeURIComponent(user.username)}` : undefined);

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium">{displayName}</p>
              {displayEmail ? (
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
          <CardDescription>Update your details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.name || ""} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} readOnly />
            </div>
            <div className="flex justify-end">
              <Button type="button" disabled>Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
