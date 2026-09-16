"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/services/api";
import { useAuthStore } from "./authStore";

interface UserProfile { id: number; username: string; karma: number; }

export default function AuthSync() {
  const { isLoaded, isSignedIn } = useUser();
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      api.get<UserProfile>("/users/me")
        .then(({ data }) => setUser(data))
        .catch(() => {});
    } else {
      clearUser();
    }
  }, [isLoaded, isSignedIn, setUser, clearUser]);

  return null;
}
