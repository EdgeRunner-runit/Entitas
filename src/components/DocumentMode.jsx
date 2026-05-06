import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function DocumentMode({ onSimulationStart }) {
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const extractPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }
    return fullText.trim();
  };

  const extractText = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    try {
      let text;
      if (file.type === "application/pdf") {
        text = await extractPdf(file);
      } else {
        text = await extractText(file);
      }

      const characterName = file.name.replace(/\.[^.]+$/, "");
      const systemPrompt = `You are a personality simulator. You have been provided with the following document that encodes a personality, character, or person. Fully adopt this personality. Respond as this person would — using their tone, speech patterns, vocabulary, beliefs, and knowledge boundaries. Never break character. Never reference that you are an AI or that you are reading a document.\n\nDocument content:\n${text}`;

      onSimulationStart({
        characterName,
        systemPrompt,
        apiKey: null,
        encryptedKey: null,
      });
    } catch {
      setProcessing(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (processing) {
    return (
      <div className="mode-content">
        <div className="processing-state">
          <div className="spinner" />
          <div className="processing-label">Analysing document...</div>
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
      <div className="upload-zone" onClick={handleClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
        <div className="upload-label">
          <strong>Click to upload</strong> a document
        </div>
        <div className="upload-hint">PDF or plain text files accepted</div>
      </div>
    </div>
  );
}
