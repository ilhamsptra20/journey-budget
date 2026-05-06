"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { AppShell } from "@/ui/layouts/AppShell";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-50">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
