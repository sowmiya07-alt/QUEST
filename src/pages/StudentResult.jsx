import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import studentService from "../services/studentService";
import Navbar from "../components/Navbar";

export default function StudentResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResult = useCallback(async () => {
    if (!attemptId) return;
    try {
      setLoading(true);
      setError("");
      const res = await studentService.getAttempt(attemptId);
      const attemptObj = res?.attempt || res?.data?.attempt || res?.data || {};
      const mergedAttempt = {
        ...(typeof res === "object" ? res : {}),
        ...(typeof attemptObj === "object" ? attemptObj : {})
      };
      setAttempt(mergedAttempt);
    } catch (err) {
      console.error("[StudentResult] Error loading result:", err);
      setError(err.message || "Failed to load attempt scorecard.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container" style={{ maxWidth: "600px" }}>
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading attempt evaluation...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container" style={{ maxWidth: "600px" }}>
          <div className="card empty-state">
            <p>{error || "Attempt record not found."}</p>
            <Link to="/student/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const score = attempt.score ?? attempt.percentage ?? 0;
  const total = attempt.total_questions ?? attempt.total ?? 0;
  const correct = attempt.correct_count ?? attempt.correctCount ?? 0;
  const quizTitle = attempt.quiz_title || attempt.quizTitle || attempt.quiz?.title || "Quiz Assessment";
  const isPassed = score >= 70;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "600px" }}>
        <div className="result-card">
          <div
            className={`badge ${isPassed ? "badge-success" : "badge-danger"}`}
            style={{ fontSize: "14px", padding: "6px 16px" }}
          >
            {isPassed ? "✓ Passed Assessment" : "⚠ Assessment Needs Review"}
          </div>

          <h1 style={{ fontSize: "24px" }}>{quizTitle}</h1>

          <div className="score-badge">{score}%</div>

          <p style={{ color: "var(--color-text-secondary)" }}>
            {total > 0
              ? `You scored ${correct} out of ${total} questions correctly (${score}%).`
              : `Overall evaluation score: ${score}%.`}
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate(`/student/result/${attemptId}/review`)}
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
