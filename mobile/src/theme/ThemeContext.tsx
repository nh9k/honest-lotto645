import React, { createContext, useContext, useMemo, useState } from "react";
import { DARK_PALETTE, LIGHT_PALETTE, Palette } from "./colors";

interface ThemeContextValue {
  isDark: boolean;
  palette: Palette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      palette: isDark ? DARK_PALETTE : LIGHT_PALETTE,
      toggleTheme: () => setIsDark((v) => !v),
    }),
    [isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
