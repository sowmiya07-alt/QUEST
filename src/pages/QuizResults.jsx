import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function QuizResults() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quizzes, attempts: ctxAttempts } = useAuth();

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = () => {
    if (!quizId) return;
    const matchQuiz = (quizzes || []).find(q => String(q.id) === String(quizId));
    const filteredAttempts = (ctxAttempts || []).filter(a => String(a.quizId) === String(quizId) || String(a.quiz_id) === String(quizId));
    setResultsData({
      quiz_title: matchQuiz?.title || `Quiz Assessment #${quizId}`,
      quiz_code: matchQuiz?.code || "",
      results: filteredAttempts
    });
  };

  useEffect(() => {
    fetchResults();
  }, [quizId, quizzes, ctxAttempts]);

  const quizTitle = resultsData?.quiz_title || resultsData?.title || `Quiz Assessment #${quizId}`;
  const quizCode = resultsData?.quiz_code || resultsData?.code || "";
  const attempts = resultsData?.results || resultsData?.attempts || resultsData?.submissions || (Array.isArray(resultsData) ? resultsData : []);
  const totalSubmissions = attempts.length;
  const avgScore = totalSubmissions
    ? Math.round(
        attempts.reduce((acc, curr) => acc + (curr.score ?? curr.percentage ?? 0), 0) / totalSubmissions
      )
    : 0;

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
          {quizCode && (
            <span className="badge badge-accent" style={{ marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
              CODE: {quizCode}
            </span>
          )}
          <h1 style={{ fontSize: "28px" }}>Results & Submissions: {quizTitle}</h1>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={fetchResults}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading quiz submissions from Django backend...</p>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-value">{totalSubmissions}</span>
                <span className="stat-label">Total Submissions</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{avgScore}%</span>
                <span className="stat-label">Class Average Score</span>
              </div>
            </div>

            <div className="table-wrapper" style={{ marginTop: "24px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Code</th>
                    <th>Student Name</th>
                    <th>Submitted Time</th>
                    <th>Score / Total</th>
                    <th>Percentage</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px" }}>
                        No student submissions recorded yet for this assessment.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((att) => {
                      const attId = att.attempt_id || att.id || att.attemptId;
                      const score = att.score ?? att.percentage ?? 0;
                      const total = att.total_questions ?? att.total ?? 0;
                      const correct = att.correct_count ?? att.correctCount ?? 0;
                      const studentCode = att.student_code || att.studentCode || att.user_code || "STU";
                      const studentName = att.student_name || att.studentName || att.student || "Student";
                      const submittedTime = att.submitted_at || att.date || "Recently";

                      return (
                        <tr key={attId || Math.random()}>
                          <td style={{ fontFamily: "var(--font-mono)" }}>{studentCode}</td>
                          <td style={{ fontWeight: "600" }}>{studentName}</td>
                          <td style={{ color: "var(--color-text-secondary)" }}>{submittedTime}</td>
                          <td>
                            {total > 0 ? `${correct} / ${total}` : `${score}%`}
                          </td>
                          <td>
                            <span className={`badge ${score >= 70 ? "badge-success" : "badge-danger"}`}>
                              {score}%
                            </span>
                          </td>
                          <td>
                            {attId ? (
                              <Link to={`/student/result/${attId}/review`} className="btn btn-ghost btn-sm">
                                Inspect Review →
                              </Link>
                            ) : (
                              <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>N/A</span>
                            )}
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
