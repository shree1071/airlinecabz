"use client";

import { useEffect } from "react";

export default function CleanUrl() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("insforge_code")) {
        url.searchParams.delete("insforge_code");
        window.history.replaceState({}, "", url.toString() || "/");
      }
    }
  }, []);

  return null;
}
