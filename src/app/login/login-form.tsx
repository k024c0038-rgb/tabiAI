"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MOCK_SUPABASE } from "@/lib/mock/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const next = useSearchParams().get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "rateLimit">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: name ? { display_name: name } : undefined,
      },
    });
    if (error) console.error("signInWithOtp failed", error);
    // 無料プランの Supabase はメール送信回数が少ないため、上限のときは理由を伝える
    setState(!error ? "sent" : error.status === 429 || error.code?.includes("rate_limit") ? "rateLimit" : "error");
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {MOCK_SUPABASE ? (
          <div className="space-y-4 text-sm">
            <p>{t("demo")}</p>
            <Button asChild className="w-full">
              <Link href={next}>{t("backHome")}</Link>
            </Button>
          </div>
        ) : state === "sent" ? (
          <p className="text-sm">{t("sent")}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t("displayName")}</Label>
              <Input id="name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
            </div>
            {state === "error" && <p className="text-sm text-destructive">{tc("error")}</p>}
            {state === "rateLimit" && <p className="text-sm text-destructive">{t("rateLimit")}</p>}
            <Button type="submit" className="w-full" disabled={state === "sending"}>
              {t("send")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("guestNote")}</p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
