"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isAuto: boolean;
  setAutoMode: (auto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isAuto: true,
  setAutoMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getAutoTheme(): Theme {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6 ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isAuto, setIsAutoState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedAuto = localStorage.getItem("orot-theme-auto");
    const savedTheme = localStorage.getItem("orot-theme") as Theme | null;

    if (savedAuto === "false" && savedTheme) {
      setIsAutoState(false);
      setTheme(savedTheme);
    } else {
      setTheme(getAutoTheme());
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("orot-theme", theme);
  }, [theme, mounted]);

  // Auto-switch check every minute
  useEffect(() => {
    if (!isAuto || !mounted) return;
    const interval = setInterval(() => {
      setTheme(getAutoTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuto, mounted]);

  const toggleTheme = useCallback(() => {
    setIsAutoState(false);
    localStorage.setItem("orot-theme-auto", "false");
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setAutoMode = useCallback((auto: boolean) => {
    setIsAutoState(auto);
    localStorage.setItem("orot-theme-auto", String(auto));
    if (auto) setTheme(getAutoTheme());
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAuto, setAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
