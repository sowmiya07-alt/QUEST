import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const { user, quizzes: ctxQuizzes, attempts: ctxAttempts } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [inputCode, setInputCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const fetchDashboard = () => {
    setDashboardData({
      user,
      active_quizzes: (ctxQuizzes || []).filter(q => q.status === "ACTIVE" || q.assigned),
      previous_attempts: ctxAttempts || []
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, [ctxQuizzes, ctxAttempts]);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setCodeError("");
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) return;

    setJoinLoading(true);
    try {
      const res = await studentService.joinQuiz({ quiz_code: trimmed });
      const quizId = res?.quiz_id || res?.id || res?.quiz?.id;
      if (quizId) {
        navigate(`/student/quiz/${quizId}`);
        return;
      }
    } catch (err) {
      console.warn("[StudentDashboard] Backend offline for join code. Searching local quizzes.");
      const localMatch = (ctxQuizzes || []).find(q => (q.code || q.quiz_code || "").toUpperCase() === trimmed);
      if (localMatch) {
        navigate(`/student/quiz/${localMatch.id || localMatch.quiz_id}`);
        return;
      }
      setCodeError("Reference code not found or quiz is not active.");
    } finally {
      setJoinLoading(false);
    }
  };

  const studentName = dashboardData?.user?.name || user?.name || "Student";
  const studentCode = dashboardData?.user?.user_code || user?.user_code || user?.code || "STU";
  const activeQuizzes = dashboardData?.active_quizzes || dashboardData?.quizzes || [];
  const previousAttempts = dashboardData?.previous_attempts || dashboardData?.attempts || [];

  const avgScore = previousAttempts.length
    ? Math.round(
        previousAttempts.reduce((acc, curr) => acc + (curr.score ?? curr.percentage ?? 0), 0) / previousAttempts.length
      )
    : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div className="dashboard-header" style={{ marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Student Portal</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Welcome back, <strong style={{ color: "var(--color-text-primary)" }}>{studentName}</strong> • Student ID:{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{studentCode}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {/* Quick Join via Reference Code Hero Box */}
        <div className="join-code-card">
          <div className="join-code-header">
            <span style={{ fontSize: "20px" }}>⚡</span>
            <h2 className="join-code-title">Attempt Quiz through Reference Code</h2>
          </div>
          <p className="join-code-desc">
            Have an access code from your instructor? Enter it below to start your assessment immediately.
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
                placeholder="E.G. DB82KP OR REACT2024"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary join-code-btn" disabled={joinLoading}>
              {joinLoading ? "Joining..." : "Attempt Quiz →"}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="card" style={{ padding: "48px", textAlign: "center", marginTop: "24px" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading assessments and attempt records...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Available Assessments</span>
                  <div className="stat-icon-badge">📚</div>
                </div>
                <span className="stat-value">{activeQuizzes.length}</span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Completed Attempts</span>
                  <div className="stat-icon-badge">✅</div>
                </div>
                <span className="stat-value">{previousAttempts.length}</span>
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
              <span className="badge badge-neutral">{activeQuizzes.length} Total</span>
            </div>

            {activeQuizzes.length === 0 ? (
              <div className="card empty-state">
                <p>No assessments currently assigned. Enter a reference code above to join a quiz.</p>
              </div>
            ) : (
              <div className="grid-cards">
                {activeQuizzes.map((quiz) => {
                  const qId = quiz.id || quiz.quiz_id;
                  const qCode = quiz.code || quiz.quiz_code || "CODE";
                  const qCount = quiz.questions_count ?? quiz.questionsCount ?? (quiz.questions ? quiz.questions.length : 0);
                  const timeLimit = quiz.time_limit ?? quiz.timeLimit ?? 15;

                  return (
                    <div key={qId} className="quiz-card">
                      <div className="quiz-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                            CODE: {qCode}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                            ⏱ {timeLimit} mins
                          </span>
                        </div>
                        <h3 className="quiz-card-title" title={quiz.title}>{quiz.title}</h3>
                        <p className="quiz-card-desc">
                          {quiz.description || "Active assessment module."}
                        </p>
                      </div>
                      <div className="quiz-card-meta">
                        <span>{qCount} Questions</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/student/quiz/${qId}`)}
                        >
                          Start Quiz →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  {previousAttempts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px" }}>
                        No attempted quizzes recorded yet. Use a reference code above to attempt an assessment.
                      </td>
                    </tr>
                  ) : (
                    previousAttempts.map((att) => {
                      const attId = att.attempt_id || att.id || att.attemptId;
                      const score = att.score ?? att.percentage ?? 0;
                      const total = att.total_questions ?? att.total ?? 0;
                      const correct = att.correct_count ?? att.correctCount ?? 0;
                      const dateStr = att.submitted_at || att.date || "Completed";

                      return (
                        <tr key={attId}>
                          <td style={{ fontFamily: "var(--font-mono)" }}>#{attId}</td>
                          <td style={{ fontWeight: "600" }}>{att.quiz_title || att.quizTitle || "Assessment"}</td>
                          <td style={{ color: "var(--color-text-secondary)" }}>{dateStr}</td>
                          <td>
                            <span className={`badge ${score >= 70 ? "badge-success" : "badge-danger"}`}>
                              {score}% {total ? `(${correct}/${total})` : ""}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <Link to={`/student/result/${attId}`} className="btn btn-secondary btn-sm">
                                View Score
                              </Link>
                              <Link to={`/student/result/${attId}/review`} className="btn btn-ghost btn-sm">
                                Wrong Answer Review →
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
