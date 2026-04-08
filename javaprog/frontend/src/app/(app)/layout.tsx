"use client";

import { AppLayout } from "@/components/layout/AppLayout";

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}