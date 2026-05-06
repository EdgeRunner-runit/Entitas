import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import ModeSelector from "./ModeSelector";
import DocumentMode from "./DocumentMode";
import SearchMode from "./SearchMode";
import ChatWindow from "./ChatWindow";
import SettingsPanel from "./SettingsPanel";
import HelpPanel from "./HelpPanel";

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const stored = sessionStorage.getItem("wraith-sidebar");
    return stored !== null ? stored === "true" : true;
  });
  const [activeView, setActiveView] = useState("home");
  const [mode, setMode] = useState("document");
  const [simulation, setSimulation] = useState(null);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      sessionStorage.setItem("wraith-sidebar", String(next));
      return next;
    });
  }, []);

  const handleNavigate = (view) => {
    setActiveView(view);
    if (view === "simulation") {
      setSimulation(null);
    }
  };

  const handleSimulationStart = (data) => {
    setSimulation(data);
  };

  const handleBack = () => {
    setSimulation(null);
  };

  const renderContent = () => {
    if (activeView === "settings") {
      return <SettingsPanel />;
    }

    if (activeView === "help") {
      return <HelpPanel />;
    }

    if (activeView === "history") {
      return (
        <div className="home-view">
          <div className="home-brand" style={{ fontSize: 28 }}>History</div>
          <div className="home-tagline">Previous simulations will appear here</div>
        </div>
      );
    }

    if (activeView === "home") {
      return (
        <div className="home-view">
          <div className="home-brand">Wraith</div>
          <div className="home-tagline">Personality Simulation Engine</div>
          <button className="home-start-btn" onClick={() => setActiveView("simulation")}>
            New Simulation
          </button>
        </div>
      );
    }

    if (activeView === "simulation") {
      if (simulation) {
        return (
          <ChatWindow
            characterName={simulation.characterName}
            systemPrompt={simulation.systemPrompt}
            apiKey={simulation.apiKey}
            encryptedKey={simulation.encryptedKey}
            onBack={handleBack}
          />
        );
      }

      return (
        <>
          <ModeSelector mode={mode} onModeChange={setMode} />
          {mode === "document" ? (
            <DocumentMode onSimulationStart={handleSimulationStart} />
          ) : (
            <SearchMode onSimulationStart={handleSimulationStart} />
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        activeView={activeView}
        onNavigate={handleNavigate}
      />
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}
