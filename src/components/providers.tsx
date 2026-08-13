"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { usePreferencesStore } from "@/stores/preferences-store";

function PreferencesBootstrap({ children }: { children: ReactNode }) {
  const applyToDocument = usePreferencesStore((s) => s.applyToDocument);
  const isHydrated = usePreferencesStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated) applyToDocument();
  }, [isHydrated, applyToDocument]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const mode = usePreferencesStore.getState().colorMode;
      if (mode === "system") {
        usePreferencesStore.getState().applyToDocument();
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PreferencesBootstrap>{children}</PreferencesBootstrap>
      </ToastProvider>
    </QueryClientProvider>
  );
}
