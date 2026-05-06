export const THEMES = {
  black: {
    name: "Black",
    bg: "#0a0a0a",
    surface: "#141414",
    textPrimary: "#e8e6e3",
    textSecondary: "#7a7a7a",
    accent: "#b0b0b0",
    border: "#2a2a2a",
    isDark: true,
  },
  white: {
    name: "White",
    bg: "#f5f5f0",
    surface: "#ffffff",
    textPrimary: "#1a1a1a",
    textSecondary: "#6b6b6b",
    accent: "#3d3d3d",
    border: "#e0e0e0",
    isDark: false,
  },
  blue: {
    name: "Blue",
    bg: "#0b1628",
    surface: "#111e36",
    textPrimary: "#d4e0f7",
    textSecondary: "#6b8abf",
    accent: "#3b82f6",
    border: "#1e3a5f",
    isDark: true,
  },
  red: {
    name: "Red",
    bg: "#1a0808",
    surface: "#261010",
    textPrimary: "#f0d4d4",
    textSecondary: "#b06060",
    accent: "#ef4444",
    border: "#3d1515",
    isDark: true,
  },
  pink: {
    name: "Pink",
    bg: "#fdf2f4",
    surface: "#fff5f7",
    textPrimary: "#2d1a1e",
    textSecondary: "#9b6b75",
    accent: "#ec4899",
    border: "#f0d0d9",
    isDark: false,
  },
  green: {
    name: "Green",
    bg: "#061208",
    surface: "#0d1f10",
    textPrimary: "#d4f0d8",
    textSecondary: "#5fa868",
    accent: "#22c55e",
    border: "#1a3d1f",
    isDark: true,
  },
  cyan: {
    name: "Cyan",
    bg: "#06141a",
    surface: "#0d2230",
    textPrimary: "#d4eef5",
    textSecondary: "#5fa8bf",
    accent: "#06b6d4",
    border: "#153545",
    isDark: true,
  },
  orange: {
    name: "Orange",
    bg: "#1a0f05",
    surface: "#26180a",
    textPrimary: "#f5e6d4",
    textSecondary: "#bf8a5f",
    accent: "#f97316",
    border: "#3d2815",
    isDark: true,
  },
  yellow: {
    name: "Yellow",
    bg: "#faf8f0",
    surface: "#fefcf5",
    textPrimary: "#2d2a1a",
    textSecondary: "#8a8060",
    accent: "#d97706",
    border: "#e8e0c8",
    isDark: false,
  },
};

export const FONTS = [
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", category: "Geometric Sans" },
  { id: "source-serif", name: "Source Serif 4", family: "'Source Serif 4', serif", category: "Serif" },
  { id: "jetbrains", name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Monospace" },
  { id: "nunito", name: "Nunito", family: "'Nunito', sans-serif", category: "Humanist Sans" },
  { id: "playfair", name: "Playfair Display", family: "'Playfair Display', serif", category: "Display" },
];

export const DEFAULT_THEME = "black";
export const DEFAULT_FONT = "inter";

export function applyTheme(themeId, mode) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  let effectivelyDark = theme.isDark;
  if (mode === "light") effectivelyDark = false;
  else if (mode === "dark") effectivelyDark = true;
  else if (mode === "system") effectivelyDark = prefersDark;

  let bg = theme.bg;
  let surface = theme.surface;
  let textPrimary = theme.textPrimary;
  let textSecondary = theme.textSecondary;
  let border = theme.border;

  if (effectivelyDark && !theme.isDark) {
    bg = "#0a0a0a";
    surface = "#141414";
    textPrimary = "#e8e6e3";
    textSecondary = "#7a7a7a";
    border = "#2a2a2a";
  } else if (!effectivelyDark && theme.isDark) {
    bg = "#f5f5f0";
    surface = "#ffffff";
    textPrimary = "#1a1a1a";
    textSecondary = "#6b6b6b";
    border = "#e0e0e0";
  }

  root.style.setProperty("--bg", bg);
  root.style.setProperty("--surface", surface);
  root.style.setProperty("--text-primary", textPrimary);
  root.style.setProperty("--text-secondary", textSecondary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--border", border);
  root.setAttribute("data-theme-dark", effectivelyDark);
}

export function applyFont(fontId) {
  const font = FONTS.find((f) => f.id === fontId);
  if (!font) return;
  document.documentElement.style.setProperty("--font-primary", font.family);
}
