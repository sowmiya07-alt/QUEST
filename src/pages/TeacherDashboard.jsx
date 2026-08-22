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

  // Helper to format date strings
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
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="badge badge-accent">Faculty Control Center</span>
              <span className="badge badge-neutral">Portal Active</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Faculty Console</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Welcome, <strong style={{ color: "var(--color-text-primary)" }}>{user?.name || "Prof. Alex Morgan"}</strong> • Manage assessments, AI specs, & student scorecards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/staff/quiz/create/terminal" className="btn btn-secondary btn-md">
              💻 AI Spec Terminal
            </Link>
            <Link to="/staff/quiz/create/import-terminal" className="btn btn-secondary btn-md">
              📥 JSON Import Terminal
            </Link>
            <Link to="/staff/quiz/create" className="btn btn-primary btn-md">
              ⚡ Generate Quiz
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Active Quizzes</span>
              <div className="stat-icon-badge">📚</div>
            </div>
            <span className="stat-value">{quizzes.length}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Total Submissions</span>
              <div className="stat-icon-badge">📥</div>
            </div>
            <span className="stat-value">{totalSubmissions}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Class Average Score</span>
              <div className="stat-icon-badge">📈</div>
            </div>
            <span className="stat-value">{avgClassScore}%</span>
          </div>
        </div>

        {/* Managed Quizzes Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Managed Assessments</h2>
            <span className="badge badge-neutral">{quizzes.length} Total</span>
          </div>
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
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px" }}>
                    No quizzes created yet. Click "Generate Quiz" to get started.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => {
                  const quizSubmissions = attempts.filter((a) => a.quizId === quiz.id);
                  const diffUpper = (quiz.difficulty || "MEDIUM").toUpperCase();
                  const isEasy = diffUpper === "EASY";
                  const isMedium = diffUpper === "MEDIUM";

                  return (
                    <tr key={quiz.id}>
                      <td>
                        <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                          {quiz.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={quiz.title}>
                        {quiz.title}
                      </td>
                      <td>
                        <span className={`badge ${isEasy ? "badge-success" : isMedium ? "badge-accent" : "badge-danger"}`} style={{ fontSize: "10px" }}>
                          {isEasy ? "🟢 EASY" : isMedium ? "🟡 MEDIUM" : "🔴 TOUGH"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{quiz.questions?.length || quiz.questionsCount}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: "11px" }}>
                          {quizSubmissions.length} {quizSubmissions.length === 1 ? "Submission" : "Submissions"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/staff/quiz/${quiz.id}/preview`)}
                            title="Verify and modify questions"
                          >
                            Verify & Edit
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "44px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Live Student Score Cards & Attempt Log</h2>
            <span className="badge badge-neutral">{attempts.length} Submissions</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Quiz Title</th>
                <th>Attempt Timestamp</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px" }}>
                    No student attempts submitted yet. When students complete a quiz, scorecards will display here automatically.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => {
                  const isPassed = att.score >= 70;
                  return (
                    <tr key={att.attemptId}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>
                        <span className="badge badge-neutral" style={{ fontSize: "11px" }}>
                          {att.studentCode || "STU-9482"}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600" }}>{att.studentName || "Jordan Lee"}</td>
                      <td style={{ fontWeight: "500", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={att.quizTitle}>
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
                        <Link to={`/student/result/${att.attemptId}/review`} className="btn btn-ghost btn-sm">
                          Inspect Score Card →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
