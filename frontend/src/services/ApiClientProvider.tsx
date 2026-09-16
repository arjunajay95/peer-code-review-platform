"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { initApiClient } from "./api";

export default function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    initApiClient(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
