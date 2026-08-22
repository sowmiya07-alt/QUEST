import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function PreviousAttempts() {
  const { attempts } = useAuth();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'passed', 'needs-review'

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.score >= 70).length;
  const needsReviewCount = totalAttempts - passedAttempts;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts)
    : 0;

  const filteredAttempts = attempts.filter((att) => {
    if (activeFilter === "passed") return att.score >= 70;
    if (activeFilter === "needs-review") return att.score < 70;
    return true;
  });

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
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="badge badge-accent">Diagnostic Archive</span>
            <span className="badge badge-neutral">{totalAttempts} Submissions</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Your Previous Attempts</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Track performance metrics, review diagnostic scorecards, and analyze explanation breakdowns.
          </p>
        </div>

        {/* Unique Performance Overview Banner */}
        <div className="attempt-performance-banner">
          <div className="banner-metric-group">
            <div className="banner-score-circle" title="Average Score">
              <span>{avgScore}%</span>
            </div>
            <div className="banner-stats-summary">
              <div className="banner-stat-item">
                <span className="banner-stat-num">{totalAttempts}</span>
                <span className="banner-stat-label">Total Attempts</span>
              </div>
              <div className="banner-stat-item">
                <span className="banner-stat-num" style={{ color: "#34D399" }}>{passedAttempts}</span>
                <span className="banner-stat-label">Passed (≥70%)</span>
              </div>
              <div className="banner-stat-item">
                <span className="banner-stat-num" style={{ color: "#F87171" }}>{needsReviewCount}</span>
                <span className="banner-stat-label">Needs Review</span>
              </div>
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="attempt-filter-group">
            <button
              className={`attempt-filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All ({totalAttempts})
            </button>
            <button
              className={`attempt-filter-btn ${activeFilter === "passed" ? "active" : ""}`}
              onClick={() => setActiveFilter("passed")}
            >
              Passed ({passedAttempts})
            </button>
            <button
              className={`attempt-filter-btn ${activeFilter === "needs-review" ? "active" : ""}`}
              onClick={() => setActiveFilter("needs-review")}
            >
              Needs Review ({needsReviewCount})
            </button>
          </div>
        </div>

        {/* Attempt Log Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Assessment History Stream</h2>
          <Link to="/student/dashboard" className="btn btn-secondary btn-sm">
            + Take New Assessment
          </Link>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="card empty-state">
            <span className="empty-state-icon" style={{ fontSize: "36px" }}>📋</span>
            <h3 style={{ fontSize: "18px", marginTop: "8px" }}>No attempts found</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              {activeFilter !== "all" ? "No attempts match the selected filter." : "Once you complete an assessment, your history cards will appear here."}
            </p>
            <Link to="/student/dashboard" className="btn btn-primary btn-md" style={{ marginTop: "16px" }}>
              Explore Assessments →
            </Link>
          </div>
        ) : (
          /* Timeline Stream List View (Distinct from Dashboard Cards) */
          <div className="attempt-stream">
            {filteredAttempts.map((att) => {
              const isPassed = att.score >= 70;
              return (
                <div key={att.attemptId} className={`attempt-stream-card ${isPassed ? "passed" : "needs-review"}`}>
                  <div className="attempt-info-group">
                    <div className="attempt-title-row">
                      <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                        {att.attemptId}
                      </span>
                      <h3 className="attempt-quiz-title" title={att.quizTitle}>{att.quizTitle}</h3>
                      <span className={`badge ${isPassed ? "badge-success" : "badge-danger"}`} style={{ fontSize: "11px" }}>
                        {isPassed ? "✓ Passed" : "⚠ Needs Review"}
                      </span>
                    </div>

                    <div className="attempt-progress-row">
                      <div className="attempt-score-bar-bg" title={`${att.score}% Score`}>
                        <div
                          className={`attempt-score-bar-fill ${isPassed ? "passed" : "needs-review"}`}
                          style={{ width: `${Math.max(att.score, 5)}%` }}
                        />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                        {att.score}% <span style={{ fontWeight: "normal", color: "var(--color-text-secondary)" }}>({att.correctCount}/{att.total} correct)</span>
                      </span>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "12px", marginLeft: "auto" }}>
                        ⏱ {formatDateString(att.date)}
                      </span>
                    </div>
                  </div>

                  <div className="attempt-actions-group">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/student/result/${att.attemptId}`)}
                    >
                      Score Card
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/student/result/${att.attemptId}/review`)}
                    >
                      Diagnostic Review →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
