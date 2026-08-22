import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function PreviousAttempts() {
  const { attempts } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px" }}>Your Previous Attempts</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Review past scores, answer choices, and detailed explanation reports.
          </p>
        </div>

        {attempts.length === 0 ? (
          <div className="card empty-state">
            <span className="empty-state-icon">📋</span>
            <p>No attempts recorded yet.</p>
            <Link to="/student/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
              Take an assessment
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attempt ID</th>
                  <th>Quiz Title</th>
                  <th>Date & Time</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.attemptId}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{att.attemptId}</td>
                    <td style={{ fontWeight: "600" }}>{att.quizTitle}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{att.date}</td>
                    <td>
                      <span className={`badge ${att.score >= 70 ? "badge-success" : "badge-danger"}`}>
                        {att.score}% ({att.correctCount}/{att.total})
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/student/result/${att.attemptId}`)}
                        >
                          View Score
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/student/result/${att.attemptId}/review`)}
                        >
                          Wrong Answer Review →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
