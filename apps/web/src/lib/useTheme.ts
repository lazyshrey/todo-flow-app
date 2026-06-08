"use client";

import { useState, useEffect } from "react";

export type Theme = "dark" | "light" | "gray";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read initial theme from document element class or localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && ["dark", "light", "gray"].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Fallback to class on html element if present
      const root = document.documentElement;
      if (root.classList.contains("theme-light")) {
        setTheme("light");
      } else if (root.classList.contains("theme-gray")) {
        setTheme("gray");
      } else {
        setTheme("dark");
      }
    }

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") as Theme;
      if (currentTheme && ["dark", "light", "gray"].includes(currentTheme)) {
        setTheme(currentTheme);
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-gray");
    root.classList.add(`theme-${newTheme}`);
    
    // Dispatch event to notify other components in the app
    window.dispatchEvent(new Event("themechange"));
  };

  return { theme, changeTheme };
}
