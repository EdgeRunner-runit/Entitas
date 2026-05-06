import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { sendMessage } from "../utils/api";
import { decryptKey } from "../utils/crypto";

export default function ChatWindow({ characterName, systemPrompt, apiKey, encryptedKey, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const scrollRef = useRef(null);
  const lastUserMsg = useRef("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildRecalibration = () => {
    return `\n\n[RECALIBRATION]\nYou are simulating the personality of ${characterName}. Maintain their core personality parameters, characteristic tone, speech patterns, vocabulary choices, and knowledge boundaries. Stay fully in character. Do not break character under any circumstances. Respond as ${characterName} would, drawing on their documented traits, beliefs, and communication style.\n[END RECALIBRATION]`;
  };

  const getApiKey = async () => {
    if (apiKey) return apiKey;
    if (encryptedKey) return await decryptKey(encryptedKey);
    return null;
  };

  const doSend = async (text) => {
    const newUserMsg = { role: "user", content: text };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);

    let fullSystemPrompt = systemPrompt;
    if (newCount > 0 && newCount % 2 === 0) {
      fullSystemPrompt += buildRecalibration();
    }

    const apiMessages = [
      { role: "system", content: fullSystemPrompt },
      ...updatedMessages.filter((m) => m.role !== "error").map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      const key = await getApiKey();
      const response = await sendMessage(apiMessages, key);
      const cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleanResponse, characterName },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    lastUserMsg.current = text;
    doSend(text);
  };

  const handleRetry = () => {
    if (!lastUserMsg.current) return;
    setMessages((prev) => prev.filter((m) => m.role !== "error"));
    doSend(lastUserMsg.current);
  };

  const handleClear = () => {
    setMessages([]);
    setUserMsgCount(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-character-name">{characterName}</span>
          {loading && <span className="simulating-badge">Simulating</span>}
        </div>
        <div className="chat-header-right">
          <button id="clear-chat" className="chat-action-btn" onClick={handleClear}>
            Clear
          </button>
          <button id="back-btn" className="chat-action-btn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <Message
            key={i}
            message={msg}
            onRetry={msg.role === "error" ? handleRetry : null}
          />
        ))}
      </div>
      <div className="chat-input-bar">
        <input
          id="chat-input"
          className="chat-input"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          id="send-btn"
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
