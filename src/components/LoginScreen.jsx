import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required");
      return;
    }
    sessionStorage.setItem("entitas-user", username.trim());
    navigate("/dashboard");
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-title">Entitas</div>
        <div className="login-subtitle">Personality Simulator</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            id="login-username"
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            autoComplete="off"
          />
          <input
            id="login-password"
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />
          {error && <div className="login-error">{error}</div>}
          <button
            id="login-submit"
            className="login-btn"
            type="submit"
            disabled={!username.trim() || !password.trim()}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
