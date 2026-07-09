"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Clears the Auth.js session cookie server-side, then returns home.
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-400">Signing out…</p>
    </div>
  );
}
