import { useState, useEffect } from "react";
import { THEMES, FONTS, applyTheme, applyFont } from "../utils/themes";

export default function SettingsPanel() {
  const [theme, setTheme] = useState(() => localStorage.getItem("entitas-theme") || "black");
  const [font, setFont] = useState(() => localStorage.getItem("entitas-font") || "inter");
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem("entitas-mode") || "dark");

  useEffect(() => {
    applyTheme(theme, displayMode);
    localStorage.setItem("entitas-theme", theme);
  }, [theme, displayMode]);

  useEffect(() => {
    applyFont(font);
    localStorage.setItem("entitas-font", font);
  }, [font]);

  useEffect(() => {
    localStorage.setItem("entitas-mode", displayMode);
  }, [displayMode]);

  useEffect(() => {
    if (displayMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [displayMode, theme]);

  return (
    <div className="settings-panel">
      <div className="settings-title">Settings</div>

      <div className="settings-section">
        <div className="settings-section-title">Colour Theme</div>
        <div className="theme-grid">
          {Object.entries(THEMES).map(([id, t]) => (
            <button
              key={id}
              className={`theme-swatch ${theme === id ? "active" : ""}`}
              onClick={() => setTheme(id)}
            >
              <div className="theme-color" style={{ background: t.accent }} />
              <span className="theme-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Font</div>
        <div className="font-list">
          {FONTS.map((f) => (
            <button
              key={f.id}
              className={`font-option ${font === f.id ? "active" : ""}`}
              onClick={() => setFont(f.id)}
              style={{ fontFamily: f.family }}
            >
              <span className="font-option-name">{f.name}</span>
              <span className="font-option-category">{f.category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Display Mode</div>
        <div className="mode-buttons">
          {["light", "dark", "system"].map((m) => (
            <button
              key={m}
              className={`mode-btn-option ${displayMode === m ? "active" : ""}`}
              onClick={() => setDisplayMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
