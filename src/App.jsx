import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import { useEffect } from "react";
import { applyTheme, applyFont } from "./utils/themes";

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem("wraith-theme") || "black";
    const font = localStorage.getItem("wraith-font") || "inter";
    const mode = localStorage.getItem("wraith-mode") || "dark";
    applyTheme(theme, mode);
    applyFont(font);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
