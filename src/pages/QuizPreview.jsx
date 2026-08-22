import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function QuizPreview() {
  const { quizId } = useParams();
  const { quizzes } = useAuth();
  const navigate = useNavigate();

  const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0];

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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <span className="badge badge-accent" style={{ marginBottom: "8px" }}>CODE: {quiz?.code}</span>
            <h1 style={{ fontSize: "28px" }}>Quiz Preview: {quiz?.title}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              {quiz?.description} | Time limit: {quiz?.timeLimit} mins
            </p>
          </div>
          <Link to={`/student/quiz/${quiz?.id}`} className="btn btn-primary btn-md">
            Test Taking Experience →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quiz?.questions?.map((q, i) => (
            <div key={q.id || i} className="card">
              <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>
                {i + 1}. {q.question}
              </h3>
              <div className="options-grid">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`option-btn ${q.correctIndex === oIdx ? "correct" : ""}`}
                    style={{ cursor: "default" }}
                  >
                    <span className="option-indicator">{String.fromCharCode(65 + oIdx)}</span>
                    <span>{opt}</span>
                    {q.correctIndex === oIdx && <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓ Correct Answer</span>}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="review-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
