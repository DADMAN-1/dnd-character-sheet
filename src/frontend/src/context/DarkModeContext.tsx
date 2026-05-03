import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "dungeonscribe-darkmode";
const ACCENT_KEY = "dungeonscribe-accent";
const PRESET_KEY = "dungeonscribe-preset";

const DEFAULT_ACCENT = "#c9a35a";
const DEFAULT_PRESET = "dark";

const THEME_PRESETS = ["dark", "light", "midnight", "forest"] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

export interface ThemeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
  /** @deprecated use toggleDarkMode */ toggle: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
}

const DarkModeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleDarkMode: () => {},
  toggle: () => {},
  accentColor: DEFAULT_ACCENT,
  setAccentColor: () => {},
  themePreset: DEFAULT_PRESET,
  setThemePreset: () => {},
});

function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = readStorage(STORAGE_KEY, "true");
    return stored === "true";
  });

  const [accentColor, setAccentColorState] = useState<string>(() =>
    readStorage(ACCENT_KEY, DEFAULT_ACCENT),
  );

  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    const stored = readStorage(PRESET_KEY, DEFAULT_PRESET);
    return THEME_PRESETS.includes(stored as ThemePreset)
      ? (stored as ThemePreset)
      : DEFAULT_PRESET;
  });

  // Apply dark/light class + theme preset classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    // Dark/light base
    if (isDark) {
      root.classList.add("ds-dark");
      root.classList.remove("ds-light");
    } else {
      root.classList.add("ds-light");
      root.classList.remove("ds-dark");
    }
    // Theme preset classes
    root.classList.remove("theme-midnight", "theme-forest");
    if (themePreset === "midnight") root.classList.add("theme-midnight");
    else if (themePreset === "forest") root.classList.add("theme-forest");

    writeStorage(STORAGE_KEY, String(isDark));
    writeStorage(PRESET_KEY, themePreset);
  }, [isDark, themePreset]);

  // Apply accent color CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--ds-gold", accentColor);
    writeStorage(ACCENT_KEY, accentColor);
  }, [accentColor]);

  const toggleDarkMode = useCallback(() => setIsDark((prev) => !prev), []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  const setThemePreset = useCallback((preset: ThemePreset) => {
    setThemePresetState(preset);
    // Mirror isDark to preset's natural mode
    if (preset === "light") setIsDark(false);
    else setIsDark(true);
  }, []);

  return (
    <DarkModeContext.Provider
      value={{
        isDark,
        toggleDarkMode,
        toggle: toggleDarkMode,
        accentColor,
        setAccentColor,
        themePreset,
        setThemePreset,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode(): ThemeContextType {
  return useContext(DarkModeContext);
}
