"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

function getResolved(t: Theme): "light" | "dark" {
  if (t === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return t;
}

function readStorage(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("nexus-theme") as Theme) ?? "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStorage);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    getResolved(readStorage()),
  );

  useEffect(() => {
    const resolved = getResolved(theme);
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        const r = mq.matches ? "dark" : "light";
        setResolvedTheme(r);
        document.documentElement.classList.toggle("dark", mq.matches);
      };
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("nexus-theme", t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
