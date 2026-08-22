import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function JoinQuiz() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { quizzes } = useAuth();
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    const quiz = quizzes.find((q) => q.code.toUpperCase() === code.trim().toUpperCase());
    if (quiz) {
      navigate(`/student/quiz/${quiz.id}`);
    } else {
      setError("Quiz code not found. Please verify the code with your instructor.");
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "480px" }}>
        <h1 style={{ fontSize: "28px", textAlign: "center", marginBottom: "8px" }}>Join Assessment</h1>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
          Enter the access code provided by your instructor.
        </p>

        <div className="card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="label">Quiz Code</label>
              <input
                className="input"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="e.g. REACT2024"
                style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)", fontSize: "16px", textAlign: "center" }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: "12px" }}>
              Enter Assessment Room →
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "block", marginBottom: "8px" }}>Quick Join Demo Quizzes:</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/student/quiz/${q.id}`)}
                >
                  {q.code} ({q.title.slice(0, 15)}...)
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
