"use client";

import { useSyncUser } from "@/hooks/use-sync-user";

/**
 * Renders inside the dashboard layout and syncs the Clerk user to InsForge.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  useSyncUser();
  return <>{children}</>;
}
