"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { usePreferencesStore } from "@/stores/preferences-store";

function PreferencesBootstrap({ children }: { children: ReactNode }) {
  const applyToDocument = usePreferencesStore((s) => s.applyToDocument);
  const setHydrated = usePreferencesStore((s) => s.setHydrated);

  useEffect(() => {
    setHydrated(true);
    applyToDocument();
  }, [applyToDocument, setHydrated]);

  useEffect(() => {
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
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
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
