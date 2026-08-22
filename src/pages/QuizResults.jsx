import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function QuizResults() {
  const { quizId } = useParams();
  const { quizzes, attempts } = useAuth();
  const navigate = useNavigate();

  const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0];
  const quizAttempts = attempts.filter((a) => a.quizId === quiz?.id);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/staff/dashboard")}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Staff Dashboard
        </button>

        <div style={{ marginBottom: "24px" }}>
          <span className="badge badge-accent" style={{ marginBottom: "8px" }}>CODE: {quiz?.code}</span>
          <h1 style={{ fontSize: "28px" }}>Results & Submissions: {quiz?.title}</h1>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{quizAttempts.length}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {quizAttempts.length
                ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length)
                : 0}%
            </span>
            <span className="stat-label">Class Average Score</span>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: "24px" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Code</th>
                <th>Attempt Date</th>
                <th>Correct / Total</th>
                <th>Percentage</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {quizAttempts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No student submissions recorded yet.
                  </td>
                </tr>
              ) : (
                quizAttempts.map((att) => (
                  <tr key={att.attemptId}>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{att.studentCode || "STU-9482"}</td>
                    <td>{att.date}</td>
                    <td>{att.correctCount} / {att.total}</td>
                    <td>
                      <span className={`badge ${att.score >= 70 ? "badge-success" : "badge-danger"}`}>
                        {att.score}%
                      </span>
                    </td>
                    <td>
                      <Link to={`/student/result/${att.attemptId}/review`} className="btn btn-ghost btn-sm">
                        Inspect Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
