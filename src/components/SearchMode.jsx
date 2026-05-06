import { useState } from "react";
import { DEFAULT_API_KEY } from "../utils/api";
import { encryptKey } from "../utils/crypto";

export default function SearchMode({ onSimulationStart }) {
  const [name, setName] = useState("");
  const [era, setEra] = useState("");
  const [profession, setProfession] = useState("");
  const [nationality, setNationality] = useState("");
  const [keySource, setKeySource] = useState("default");
  const [customKey, setCustomKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isKeyValid = keySource === "default" || customKey.length >= 20;
  const canSubmit = name.trim() && isKeyValid && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    let apiKey = null;
    let encryptedKeyData = null;

    if (keySource === "default") {
      apiKey = DEFAULT_API_KEY;
    } else {
      if (customKey.length < 20) {
        setKeyError("API key must be at least 20 characters");
        setSubmitting(false);
        return;
      }
      encryptedKeyData = await encryptKey(customKey);
    }

    const details = [];
    if (era.trim()) details.push(`Era/Time Period: ${era.trim()}`);
    if (profession.trim()) details.push(`Profession: ${profession.trim()}`);
    if (nationality.trim()) details.push(`Nationality: ${nationality.trim()}`);

    const detailsBlock = details.length > 0 ? `\n\nIdentifying details:\n${details.join("\n")}` : "";

    const systemPrompt = `You are a personality simulator. You are simulating ${name.trim()}. Use everything you know about this person — their documented personality, speech patterns, beliefs, opinions, vocabulary, mannerisms, historical context, and public persona — to respond as they would. Stay fully in character at all times. Never break character. Never reference that you are an AI.${detailsBlock}`;

    onSimulationStart({
      characterName: name.trim(),
      systemPrompt,
      apiKey,
      encryptedKey: encryptedKeyData,
    });
  };

  return (
    <div className="mode-content">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="person-name">Person Name</label>
          <input
            id="person-name"
            className="form-input"
            type="text"
            placeholder="e.g. Marcus Aurelius"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="era">Era / Time Period</label>
            <input
              id="era"
              className="form-input"
              type="text"
              placeholder="e.g. 2nd century"
              value={era}
              onChange={(e) => setEra(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profession">Profession</label>
            <input
              id="profession"
              className="form-input"
              type="text"
              placeholder="e.g. Emperor"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="nationality">Nationality</label>
            <input
              id="nationality"
              className="form-input"
              type="text"
              placeholder="e.g. Roman"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">API Configuration</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="keySource"
                checked={keySource === "default"}
                onChange={() => { setKeySource("default"); setKeyError(""); }}
              />
              Use Default Model
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="keySource"
                checked={keySource === "custom"}
                onChange={() => setKeySource("custom")}
              />
              Use My API Key
            </label>
          </div>
        </div>

        {keySource === "custom" && (
          <div className="form-group">
            <label className="form-label" htmlFor="api-key">Your API Key</label>
            <input
              id="api-key"
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
          id="start-simulation"
          className="submit-btn"
          type="submit"
          disabled={!canSubmit}
        >
          {submitting ? "Initialising..." : "Begin Simulation"}
        </button>
      </form>
    </div>
  );
}
