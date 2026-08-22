import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function StudentResult() {
  const { attemptId } = useParams();
  const { attempts } = useAuth();
  const navigate = useNavigate();

  const attempt = attempts.find((a) => a.attemptId === attemptId) || attempts[0];

  if (!attempt) return null;

  const isPassed = attempt.score >= 70;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "600px" }}>
        <div className="result-card">
          <div className={`badge ${isPassed ? "badge-success" : "badge-danger"}`} style={{ fontSize: "14px", padding: "6px 16px" }}>
            {isPassed ? "✓ Passed Assessment" : "⚠ Assessment Needs Review"}
          </div>

          <h1 style={{ fontSize: "24px" }}>{attempt.quizTitle}</h1>

          <div className="score-badge">{attempt.score}%</div>

          <p style={{ color: "var(--color-text-secondary)" }}>
            You scored {attempt.correctCount} out of {attempt.total} questions correctly.
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate(`/student/result/${attempt.attemptId}/review`)}
            >
              Inspect Diagnostic Review →
            </button>
            <Link to="/student/dashboard" className="btn btn-secondary btn-md">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
