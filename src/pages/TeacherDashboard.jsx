import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { staffService } from "../services/staffService";
import Navbar from "../components/Navbar";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error("[TeacherDashboard] Error fetching staff dashboard:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalQuizzes = dashboardData?.total_quizzes ?? dashboardData?.quizzes?.length ?? 0;
  const activeQuizzes = dashboardData?.active_quizzes ?? dashboardData?.active_count ?? (dashboardData?.quizzes ? dashboardData.quizzes.filter(q => q.status === "ACTIVE" || q.assigned).length : 0);
  const totalAttempts = dashboardData?.total_attempts ?? dashboardData?.attempts?.length ?? dashboardData?.recent_attempts?.length ?? 0;
  const averageScore = dashboardData?.average_score ?? dashboardData?.avg_score ?? 0;
  const quizzes = dashboardData?.quizzes || dashboardData?.recent_quizzes || [];
  const attempts = dashboardData?.attempts || dashboardData?.recent_attempts || [];

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        {/* Top Header */}
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Faculty Console</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Welcome, <strong style={{ color: "var(--color-text-primary)" }}>{user?.name || "Staff Member"}</strong> • Manage assessments, AI specs, & student scorecards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/staff/quiz/create/terminal" className="btn btn-secondary btn-md">
              💻 AI Spec Terminal
            </Link>
            <Link to="/staff/quiz/create" className="btn btn-primary btn-md">
              + Create Quiz
            </Link>
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading dashboard metrics and assessments...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Total Quizzes</span>
                  <div className="stat-icon-badge">📚</div>
                </div>
                <span className="stat-value">{totalQuizzes}</span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Active Quizzes</span>
                  <div className="stat-icon-badge">⚡</div>
                </div>
                <span className="stat-value">{activeQuizzes}</span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Total Submissions</span>
                  <div className="stat-icon-badge">📥</div>
                </div>
                <span className="stat-value">{totalAttempts}</span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Class Average Score</span>
                  <div className="stat-icon-badge">📈</div>
                </div>
                <span className="stat-value">{averageScore}%</span>
              </div>
            </div>

            {/* Managed Quizzes Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Managed Quizzes</h2>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px" }}>
                        No quizzes created yet. Click "+ Create Quiz" to create your first assessment.
                      </td>
                    </tr>
                  ) : (
                    quizzes.map((quiz) => {
                      const quizId = quiz.id || quiz.quiz_id;
                      const quizCode = quiz.code || quiz.quiz_code || "DRAFT";
                      const questionCount = quiz.questions_count ?? quiz.questionsCount ?? (quiz.questions ? quiz.questions.length : 0);
                      const isQuizActive = quiz.status === "ACTIVE" || quiz.is_active || quiz.assigned;

                      return (
                        <tr key={quizId}>
                          <td>
                            <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                              {quizCode}
                            </span>
                          </td>
                          <td style={{ fontWeight: "600", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={quiz.title}>
                            {quiz.title}
                          </td>
                          <td>
                            <span className="badge badge-neutral" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                              {quiz.difficulty || "MEDIUM"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>{questionCount}</td>
                          <td>
                            <span className={`badge ${isQuizActive ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "11px" }}>
                              {quiz.status || (isQuizActive ? "ACTIVE" : "DRAFT")}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => navigate(`/staff/quiz/${quizId}/preview`)}
                                title="Verify questions and settings"
                              >
                                Preview & Manage
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/staff/quiz/${quizId}/results`)}
                              >
                                Score Cards
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

            {/* Live Student Score Cards Section */}
            {attempts.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "44px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Recent Student Submissions</h2>
                    <span className="badge badge-neutral">{attempts.length} Total</span>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Code</th>
                        <th>Student Name</th>
                        <th>Quiz Title</th>
                        <th>Submitted At</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((att) => {
                        const attId = att.attempt_id || att.attemptId || att.id;
                        const score = att.score ?? att.percentage ?? 0;
                        const total = att.total_questions ?? att.total ?? 0;
                        const correct = att.correct_count ?? att.correctCount ?? 0;

                        return (
                          <tr key={attId}>
                            <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>
                              {att.student_code || att.studentCode || "STU"}
                            </td>
                            <td>{att.student_name || att.studentName || att.student || "Student"}</td>
                            <td style={{ fontWeight: "500", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {att.quiz_title || att.quizTitle || "Assessment"}
                            </td>
                            <td style={{ color: "var(--color-text-secondary)" }}>{att.submitted_at || att.date || "Recently"}</td>
                            <td>
                              <span className={`badge ${score >= 70 ? "badge-success" : "badge-danger"}`}>
                                {score}% {total ? `(${correct}/${total})` : ""}
                              </span>
                            </td>
                            <td>
                              <Link to={`/student/result/${attId}/review`} className="btn btn-ghost btn-sm">
                                Review →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
