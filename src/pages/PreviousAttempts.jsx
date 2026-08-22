import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentService } from "../services/studentService";
import Navbar from "../components/Navbar";

export default function PreviousAttempts() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await studentService.getDashboard();
      const list = res?.previous_attempts || res?.attempts || [];
      setAttempts(list);
    } catch (err) {
      console.error("[PreviousAttempts] Error fetching attempts:", err);
      setError(err.message || "Failed to load previous attempts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

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

        {error && (
          <div className="form-error" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={fetchAttempts}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading attempt history...</p>
          </div>
        ) : attempts.length === 0 ? (
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
                {attempts.map((att) => {
                  const attId = att.attempt_id || att.id || att.attemptId;
                  const score = att.score ?? att.percentage ?? 0;
                  const total = att.total_questions ?? att.total ?? 0;
                  const correct = att.correct_count ?? att.correctCount ?? 0;
                  const dateStr = att.submitted_at || att.date || "Completed";

                  return (
                    <tr key={attId}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>#{attId}</td>
                      <td style={{ fontWeight: "600" }}>{att.quiz_title || att.quizTitle || "Assessment"}</td>
                      <td style={{ color: "var(--color-text-secondary)" }}>{dateStr}</td>
                      <td>
                        <span className={`badge ${score >= 70 ? "badge-success" : "badge-danger"}`}>
                          {score}% {total > 0 ? `(${correct}/${total})` : ""}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/student/result/${attId}`)}
                          >
                            View Score
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/student/result/${attId}/review`)}
                          >
                            Wrong Answer Review →
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
