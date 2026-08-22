import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const { user, quizzes, attempts } = useAuth();
  const navigate = useNavigate();

  const userAttempts = attempts.filter((a) => a.studentCode === user?.code || true);
  const avgScore = userAttempts.length
    ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.score, 0) / userAttempts.length)
    : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px" }}>Welcome back, {user?.name}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Student ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{user?.code}</span>
            </p>
          </div>
          <Link to="/student/join" className="btn btn-primary btn-md">
            + Join Quiz with Code
          </Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{quizzes.length}</span>
            <span className="stat-label">Available Quizzes</span>
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

        <h2 style={{ fontSize: "20px", marginBottom: "16px", marginTop: "32px" }}>Available Assessments</h2>
        <div className="grid-cards">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge badge-accent">CODE: {quiz.code}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>⏱ {quiz.timeLimit} mins</span>
                </div>
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p style={{ fontSize: "13px", marginTop: "6px", color: "var(--color-text-secondary)" }}>
                  {quiz.description}
                </p>
              </div>
              <div className="quiz-card-meta">
                <span>{quiz.questionsCount || quiz.questions?.length} Questions</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                >
                  Start Assessment →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
