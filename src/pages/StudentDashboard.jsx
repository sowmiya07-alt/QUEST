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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px" }}>Student Portal — Welcome, {user?.name}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Student ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{user?.code}</span>
            </p>
          </div>
        </div>

        {/* Quick Join via Reference Code Hero Box */}
        <div className="card" style={{ marginBottom: "24px", background: "var(--color-elevated)" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>⚡ Attempt Quiz through Reference Code</h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
            Have a reference code from your teacher? Enter it below to start your assessment immediately.
          </p>

          {codeError && <div className="form-error">{codeError}</div>}

          <form onSubmit={handleJoinByCode} style={{ display: "flex", gap: "12px" }}>
            <input
              className="input"
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setCodeError("");
              }}
              placeholder="e.g. REACT2024 or QUIZ8821"
              style={{ fontFamily: "var(--font-mono)", fontSize: "16px", letterSpacing: "0.05em", textTransform: "uppercase" }}
            />
            <button type="submit" className="btn btn-primary btn-md">
              Attempt Quiz →
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{quizzes.length}</span>
            <span className="stat-label">Assigned Quizzes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userAttempts.length}</span>
            <span className="stat-label">Completed Attempts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgScore}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>

        {/* Active Quizzes List */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px", marginTop: "32px" }}>Available Assessments</h2>
        <div className="grid-cards">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)" }}>
                    CODE: {quiz.code}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>⏱ {quiz.timeLimit} mins</span>
                </div>
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p style={{ fontSize: "13px", marginTop: "6px", color: "var(--color-text-secondary)" }}>
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
