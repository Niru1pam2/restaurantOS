import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
};

const applyThemeToDocument = (theme) => {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }
};

// Initialize theme on script load
const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    applyThemeToDocument(nextTheme);
    set({ theme: nextTheme });
  },
  setTheme: (newTheme) => {
    applyThemeToDocument(newTheme);
    set({ theme: newTheme });
  },
}));
