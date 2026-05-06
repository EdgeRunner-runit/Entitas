export default function Message({ message, onRetry }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div className={`message ${isUser ? "user" : isError ? "error" : "assistant"}`}>
      {!isUser && (
        <div className="message-sender">
          {isError ? "System" : message.characterName || "Wraith"}
        </div>
      )}
      <div className="message-bubble">{message.content}</div>
      {isError && onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
