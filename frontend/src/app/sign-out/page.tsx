"use client";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  useEffect(() => {
    signOut(() => router.push("/"));
  }, []);
  return <div className="p-8 text-sm text-zinc-500">Signing out…</div>;
}
