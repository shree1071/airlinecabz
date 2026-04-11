"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Syncs the currently signed-in Clerk user to the InsForge `users` table.
 * Should be rendered once in the app (e.g. inside layout or dashboard).
 */
export function useSyncUser() {
  const { user, isSignedIn } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || synced.current) return;

    const sync = async () => {
      try {
        await fetch("/api/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.imageUrl,
          }),
        });
        synced.current = true;
      } catch (err) {
        console.error("Failed to sync user:", err);
      }
    };

    sync();
  }, [isSignedIn, user]);
}
