export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="mode-selector">
      <div className="mode-toggle">
        <div className={`mode-slider ${mode === "search" ? "right" : ""}`} />
        <button
          id="mode-document"
          className={`mode-btn ${mode === "document" ? "active" : ""}`}
          onClick={() => onModeChange("document")}
        >
          Document Mode
        </button>
        <button
          id="mode-search"
          className={`mode-btn ${mode === "search" ? "active" : ""}`}
          onClick={() => onModeChange("search")}
        >
          Search Mode
        </button>
      </div>
    </div>
  );
}
