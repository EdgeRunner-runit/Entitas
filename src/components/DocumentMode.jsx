import { useState, useRef } from "react";
import { extractPdfText, extractPlainText, buildPersonalityProfile, buildSystemPrompt } from "../utils/pdfProcessor";
import { DEFAULT_API_KEY } from "../utils/api";
import { encryptKey } from "../utils/crypto";

export default function DocumentMode({ onSimulationStart }) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [keySource, setKeySource] = useState("default");
  const [customKey, setCustomKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhase("processing");
    setError("");
    setProgress({ phase: "reading", current: 0, total: 0 });

    try {
      let rawText;

      if (file.type === "application/pdf") {
        const result = await extractPdfText(file, (p) => {
          setProgress(p);
        });
        rawText = result.pages.map((p) => p.text).join("\n\n");
      } else {
        setProgress({ phase: "reading", current: 1, total: 1 });
        rawText = await extractPlainText(file);
      }

      if (!rawText || rawText.trim().length < 50) {
        throw new Error("The document does not contain enough text to build a personality profile. Please upload a document with more content.");
      }

      setProgress({ phase: "analysing", current: 0, total: 0 });

      const personalityProfile = buildPersonalityProfile(rawText, file.name);
      setProfile(personalityProfile);
      setPhase("review");
    } catch (err) {
      setError(err.message || "Failed to process the document");
      setPhase("idle");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartSimulation = async () => {
    if (!profile) return;

    if (keySource === "custom" && customKey.length < 20) {
      setKeyError("API key must be at least 20 characters");
      return;
    }

    let apiKey = null;
    let encryptedKeyData = null;

    if (keySource === "default") {
      apiKey = DEFAULT_API_KEY;
    } else {
      encryptedKeyData = await encryptKey(customKey);
    }

    const systemPrompt = buildSystemPrompt(profile);

    onSimulationStart({
      characterName: profile.characterName,
      systemPrompt,
      apiKey,
      encryptedKey: encryptedKeyData,
    });
  };

  const handleReset = () => {
    setPhase("idle");
    setProfile(null);
    setProgress(null);
    setError("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain" || file.name.endsWith(".txt"))) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFile({ target: { files: dataTransfer.files } });
    }
  };

  if (phase === "processing") {
    return (
      <div className="mode-content">
        <div className="processing-state">
          <div className="spinner" />
          <div className="processing-label">
            {progress?.phase === "extracting"
              ? `Extracting page ${progress.current} of ${progress.total}...`
              : progress?.phase === "analysing"
              ? "Building personality profile..."
              : "Reading document..."}
          </div>
          {progress?.phase === "extracting" && progress.total > 0 && (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "review" && profile) {
    const isKeyValid = keySource === "default" || customKey.length >= 20;

    return (
      <div className="mode-content">
        <div className="doc-review">
          <div className="doc-review-header">
            <div className="doc-review-title">{profile.characterName}</div>
            <button className="chat-action-btn" onClick={handleReset}>
              Upload Different
            </button>
          </div>

          <div className="doc-stats">
            <div className="doc-stat-item">
              <span className="doc-stat-value">{(profile.stats.totalChars / 1000).toFixed(1)}k</span>
              <span className="doc-stat-label">Characters</span>
            </div>
            <div className="doc-stat-item">
              <span className="doc-stat-value">{profile.stats.quotesFound}</span>
              <span className="doc-stat-label">Quotes Found</span>
            </div>
            <div className="doc-stat-item">
              <span className="doc-stat-value">{profile.stats.keyPhrasesFound}</span>
              <span className="doc-stat-label">Key Phrases</span>
            </div>
            {profile.stats.wasTruncated && (
              <div className="doc-stat-item">
                <span className="doc-stat-value doc-stat-warn">Trimmed</span>
                <span className="doc-stat-label">Large Document</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">API Configuration</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="docKeySource"
                  checked={keySource === "default"}
                  onChange={() => { setKeySource("default"); setKeyError(""); }}
                />
                Use Default Model
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="docKeySource"
                  checked={keySource === "custom"}
                  onChange={() => setKeySource("custom")}
                />
                Use My API Key
              </label>
            </div>
          </div>

          {keySource === "custom" && (
            <div className="form-group">
              <label className="form-label" htmlFor="doc-api-key">Your API Key</label>
              <input
                id="doc-api-key"
                className="form-input"
                type="password"
                placeholder="Enter your API key (min 20 characters)"
                value={customKey}
                onChange={(e) => { setCustomKey(e.target.value); setKeyError(""); }}
              />
              {keyError && <div className="login-error">{keyError}</div>}
            </div>
          )}

          <button
            id="start-doc-simulation"
            className="submit-btn"
            onClick={handleStartSimulation}
            disabled={!isKeyValid}
          >
            Begin Simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mode-content">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.text"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <div
        className="upload-zone"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
        <div className="upload-label">
          <strong>Click or drag</strong> to upload a document
        </div>
        <div className="upload-hint">
          PDF or plain text files — biographies, interviews, writings, or personality profiles
        </div>
      </div>
      {error && <div className="doc-error">{error}</div>}
    </div>
  );
}
