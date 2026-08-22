import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const { user, quizzes, attempts } = useAuth();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const userAttempts = attempts.filter(
    (a) => a.studentCode === user?.code || true // show all for demo accessibility
  );

  const avgScore = userAttempts.length
    ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.score, 0) / userAttempts.length)
    : 0;

  const handleJoinByCode = (e) => {
    e.preventDefault();
    setCodeError("");
    if (!inputCode.trim()) return;

    const matchedQuiz = quizzes.find(
      (q) => q.code.trim().toUpperCase() === inputCode.trim().toUpperCase()
    );

    if (matchedQuiz) {
      navigate(`/student/quiz/${matchedQuiz.id}`);
    } else {
      setCodeError("Reference code not found. Please double-check with your instructor.");
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div className="dashboard-header" style={{ marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Student Portal</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Welcome back, <strong style={{ color: "var(--color-text-primary)" }}>{user?.name}</strong> • Student ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{user?.code}</span>
            </p>
          </div>
        </div>

        {/* Quick Join via Reference Code Hero Box */}
        <div className="join-code-card">
          <div className="join-code-header">
            <span style={{ fontSize: "20px" }}>⚡</span>
            <h2 className="join-code-title">Attempt Quiz through Reference Code</h2>
          </div>
          <p className="join-code-desc">
            Have a reference code from your teacher? Enter it below to start your assessment immediately.
          </p>

          {codeError && <div className="form-error">{codeError}</div>}

          <form onSubmit={handleJoinByCode} className="join-code-form">
            <div className="join-code-input-wrapper">
              <span className="join-code-icon">🔑</span>
              <input
                className="input join-code-input"
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setCodeError("");
                }}
                placeholder="E.G. REACT2024 OR QUIZ8821"
              />
            </div>
            <button type="submit" className="btn btn-primary join-code-btn">
              Attempt Quiz →
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Assigned Quizzes</span>
              <div className="stat-icon-badge">📚</div>
            </div>
            <span className="stat-value">{quizzes.length}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Completed Attempts</span>
              <div className="stat-icon-badge">✅</div>
            </div>
            <span className="stat-value">{userAttempts.length}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Average Score</span>
              <div className="stat-icon-badge">📊</div>
            </div>
            <span className="stat-value">{avgScore}%</span>
          </div>
        </div>

        {/* Active Quizzes List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Available Assessments</h2>
          <span className="badge badge-neutral">{quizzes.length} Total</span>
        </div>

        <div className="grid-cards">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-card-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    CODE: {quiz.code}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    ⏱ {quiz.timeLimit} mins
                  </span>
                </div>
                <h3 className="quiz-card-title" title={quiz.title}>{quiz.title}</h3>
                <p className="quiz-card-desc">
                  {quiz.description || "General assessment module."}
                </p>
              </div>
              <div className="quiz-card-meta">
                <span>{quiz.questionsCount || quiz.questions?.length} Questions</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                >
                  Start Quiz →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Attempted Quizzes & Score Cards */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px", marginTop: "40px" }}>
          Previous Attempted Quizzes & Score Cards
        </h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attempt ID</th>
                <th>Quiz Title</th>
                <th>Attempt Date</th>
                <th>Score Card</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userAttempts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No attempted quizzes recorded yet. Use a reference code above to attempt a quiz.
                  </td>
                </tr>
              ) : (
                userAttempts.map((att) => (
                  <tr key={att.attemptId}>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{att.attemptId}</td>
                    <td style={{ fontWeight: "600" }}>{att.quizTitle}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{att.date}</td>
                    <td>
                      <span className={`badge ${att.score >= 70 ? "badge-success" : "badge-danger"}`}>
                        {att.score}% ({att.correctCount}/{att.total})
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link to={`/student/result/${att.attemptId}`} className="btn btn-secondary btn-sm">
                          View Score
                        </Link>
                        <Link to={`/student/result/${att.attemptId}/review`} className="btn btn-ghost btn-sm">
                          Wrong Answer Review →
                        </Link>
                      </div>
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
