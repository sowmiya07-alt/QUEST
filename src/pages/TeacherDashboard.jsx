import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function TeacherDashboard() {
  const { user, quizzes, attempts } = useAuth();
  const navigate = useNavigate();

  const totalSubmissions = attempts.length;
  const avgClassScore = attempts.length
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
    : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px" }}>Teacher Console — {user?.name}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Generate assessments, verify & assign quizzes, and inspect live student score cards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/staff/quiz/create" className="btn btn-primary btn-md">
              ⚡ Generate Quiz
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{quizzes.length}</span>
            <span className="stat-label">Active Quizzes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalSubmissions}</span>
            <span className="stat-label">Total Student Submissions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgClassScore}%</span>
            <span className="stat-label">Class Average Score</span>
          </div>
        </div>

        {/* Managed Quizzes Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px" }}>Managed Quizzes</h2>
          <Link to="/staff/quiz/create" className="btn btn-secondary btn-sm">
            + Create New Assessment
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference Code</th>
                <th>Assessment Title</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th>Submissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No quizzes created yet. Click "Generate Quiz" to get started.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => {
                  const quizSubmissions = attempts.filter((a) => a.quizId === quiz.id);
                  return (
                    <tr key={quiz.id}>
                      <td>
                        <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)" }}>
                          {quiz.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600" }}>{quiz.title}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {quiz.difficulty || "Medium"}
                        </span>
                      </td>
                      <td>{quiz.questions?.length || quiz.questionsCount}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {quizSubmissions.length} Submissions
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/staff/quiz/${quiz.id}/preview`)}
                            title="Verify, modify questions, or download quiz"
                          >
                            Verify & Modify
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/staff/quiz/${quiz.id}/results`)}
                          >
                            Score Cards ({quizSubmissions.length})
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Live Student Score Cards & Attempts Table */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px", marginTop: "40px" }}>
          Live Student Score Cards & Attempt History
        </h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Code</th>
                <th>Student Name</th>
                <th>Quiz Title</th>
                <th>Attempt Date</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No student attempts submitted yet. When students complete a quiz, scorecards will display here automatically.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.attemptId}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>
                      {att.studentCode || "STU-9482"}
                    </td>
                    <td>{att.studentName || "Jordan Lee"}</td>
                    <td>{att.quizTitle}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{att.date}</td>
                    <td>
                      <span className={`badge ${att.score >= 70 ? "badge-success" : "badge-danger"}`}>
                        {att.score}% ({att.correctCount}/{att.total})
                      </span>
                    </td>
                    <td>
                      <Link to={`/student/result/${att.attemptId}/review`} className="btn btn-ghost btn-sm">
                        Inspect Score Card →
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
