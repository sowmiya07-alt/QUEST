import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function PreviousAttempts() {
  const { attempts } = useAuth();
  const navigate = useNavigate();

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.score >= 70).length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts)
    : 0;

  // Helper to format date strings uniformly
  const formatDateString = (rawDate) => {
    if (!rawDate) return "N/A";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " • " + d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return rawDate;
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        {/* Top Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="badge badge-accent">Student History</span>
            <span className="badge badge-neutral">{totalAttempts} Total Attempts</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Your Previous Attempts</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Review past assessment scores, detailed diagnostic answer breakdowns, and step-by-step explanations.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Total Attempts</span>
              <div className="stat-icon-badge">📋</div>
            </div>
            <span className="stat-value">{totalAttempts}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Average Score</span>
              <div className="stat-icon-badge">📊</div>
            </div>
            <span className="stat-value">{avgScore}%</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Passed Assessments</span>
              <div className="stat-icon-badge">🏆</div>
            </div>
            <span className="stat-value">{passedAttempts}</span>
          </div>
        </div>

        {/* Attempt Log Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "36px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Attempt Log & Score Cards</h2>
          <Link to="/student/dashboard" className="btn btn-secondary btn-sm">
            + Take New Assessment
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="card empty-state">
            <span className="empty-state-icon" style={{ fontSize: "36px" }}>📋</span>
            <h3 style={{ fontSize: "18px", marginTop: "8px" }}>No attempts recorded yet</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Once you complete an assessment, your score cards and diagnostic reviews will appear here.
            </p>
            <Link to="/student/dashboard" className="btn btn-primary btn-md" style={{ marginTop: "16px" }}>
              Explore Assessments →
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attempt ID</th>
                  <th>Assessment Title</th>
                  <th>Date & Time</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const isPassed = att.score >= 70;
                  return (
                    <tr key={att.attemptId}>
                      <td>
                        <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          {att.attemptId}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={att.quizTitle}>
                        {att.quizTitle}
                      </td>
                      <td style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
                        {formatDateString(att.date)}
                      </td>
                      <td>
                        <span className={`badge ${isPassed ? "badge-success" : "badge-danger"}`}>
                          {att.score}% ({att.correctCount}/{att.total})
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/student/result/${att.attemptId}`)}
                          >
                            Score Summary
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/student/result/${att.attemptId}/review`)}
                          >
                            Diagnostic Review →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
