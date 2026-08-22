import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function WrongAnswerReview() {
  const { attemptId } = useParams();
  const { attempts, quizzes } = useAuth();
  const navigate = useNavigate();

  const attempt = attempts.find((a) => a.attemptId === attemptId) || attempts[0];
  const quiz = quizzes.find((q) => q.id === attempt?.quizId) || quizzes[0];

  if (!attempt || !quiz) return null;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/student/dashboard")}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px" }}>Diagnostic Answer Review</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {attempt.quizTitle} | Score: {attempt.score}% ({attempt.correctCount}/{attempt.total})
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quiz.questions.map((q, i) => {
            const userChoice = attempt.answers?.[q.id];
            const isCorrect = userChoice === q.correctIndex;

            return (
              <div key={q.id || i} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px" }}>
                    {i + 1}. {q.question}
                  </h3>
                  <span className={`badge ${isCorrect ? "badge-success" : "badge-danger"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oIdx) => {
                    let optionClass = "";
                    if (oIdx === q.correctIndex) optionClass = "correct";
                    else if (oIdx === userChoice && !isCorrect) optionClass = "wrong";

                    return (
                      <div key={oIdx} className={`option-btn ${optionClass}`} style={{ cursor: "default" }}>
                        <span className="option-indicator">{String.fromCharCode(65 + oIdx)}</span>
                        <span>{opt}</span>
                        {oIdx === q.correctIndex && <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓ Correct</span>}
                        {oIdx === userChoice && !isCorrect && (
                          <span style={{ marginLeft: "auto", fontSize: "12px" }}>✗ Your Selection</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="review-explanation">
                    <strong>Diagnostic Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
