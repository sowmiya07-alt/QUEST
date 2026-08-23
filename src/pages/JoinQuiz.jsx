import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../services/studentService";
import Navbar from "../components/Navbar";

export default function JoinQuiz() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinedQuiz, setJoinedQuiz] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await studentService.joinQuiz(trimmed);
      const quizData = res?.quiz || res?.data || res;
      setJoinedQuiz(quizData);
    } catch (err) {
      console.error("[JoinQuiz] Error joining quiz:", err);
      setError(err.message || `No active assessment found with code "${trimmed}".`);
    } finally {
      setLoading(false);
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
          {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

          {joinedQuiz ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div className="badge badge-success" style={{ fontSize: "13px", marginBottom: "12px" }}>
                ✓ Assessment Verified
              </div>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>{joinedQuiz.title}</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
                {joinedQuiz.description || "Ready to start assessment."}
              </p>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate(`/student/quiz/${joinedQuiz.id || joinedQuiz.quiz_id}`)}
              >
                Start Quiz Assessment →
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="label">Quiz Access Code</label>
                <input
                  className="input"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. QUIZ-9081"
                  style={{
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                    fontSize: "18px",
                    textAlign: "center",
                    letterSpacing: "0.1em"
                  }}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: "12px" }}
                disabled={loading}
              >
                {loading ? "Verifying Code..." : "Enter Assessment Room →"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
