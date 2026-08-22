import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function TeacherDashboard() {
  const { user, quizzes, attempts } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px" }}>Faculty Console — {user?.name}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Manage assessments, inspect student submissions, or launch AI specs.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/staff/quiz/create" className="btn btn-primary btn-md">
              + Create New Quiz
            </Link>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{quizzes.length}</span>
            <span className="stat-label">Active Quizzes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{attempts.length}</span>
            <span className="stat-label">Total Student Submissions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">100%</span>
            <span className="stat-label">System Health</span>
          </div>
        </div>

        <h2 style={{ fontSize: "20px", marginBottom: "16px", marginTop: "32px" }}>Managed Quizzes</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quiz Code</th>
                <th>Title</th>
                <th>Questions</th>
                <th>Time Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>
                      {quiz.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: "600" }}>{quiz.title}</td>
                  <td>{quiz.questions?.length || quiz.questionsCount}</td>
                  <td>{quiz.timeLimit} mins</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/staff/quiz/${quiz.id}/terminal`)}
                        title="AI Specification Terminal"
                      >
                        💻 AI Terminal
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/staff/quiz/${quiz.id}/preview`)}
                      >
                        Preview
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/staff/quiz/${quiz.id}/results`)}
                      >
                        Results ({attempts.filter(a => a.quizId === quiz.id).length})
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
