import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function WrongAnswerReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { attempts } = useAuth();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function fetchReview() {
      if (!attemptId) return;
      const match = (attempts || []).find(a => String(a.attemptId) === String(attemptId) || String(a.id) === String(attemptId) || String(a.attempt_id) === String(attemptId));
      if (match) {
        setAttempt(match);
      } else {
        setError("Diagnostic review not found.");
      }
    }
    fetchReview();
  }, [attemptId, attempts]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading diagnostic answer breakdown...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>{error || "Attempt review not found."}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/student/dashboard")} style={{ marginTop: "12px" }}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const quizTitle = attempt.quiz_title || attempt.quizTitle || "Quiz Assessment";
  const score = attempt.score ?? attempt.percentage ?? 0;
  const total = attempt.total_questions ?? attempt.total ?? 0;
  const correctCount = attempt.correct_count ?? attempt.correctCount ?? 0;
  const questions = attempt.questions || attempt.review || attempt.detailed_answers || [];

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
            {quizTitle} | Score: {score}% {total > 0 ? `(${correctCount}/${total} Correct)` : ""}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.length === 0 ? (
            <div className="card empty-state">
              <p>Detailed question breakdown is currently being processed by the server.</p>
            </div>
          ) : (
            questions.map((q, i) => {
              const qText = q.question_text || q.question || `Question ${i + 1}`;
              const isCorrect = q.is_correct ?? q.correct ?? false;
              const studentAnswer = q.student_answer || q.user_answer || "Not Answered";
              const correctAnswer = q.correct_answer || q.answer;
              const explanation = q.explanation;

              return (
                <div key={q.id || i} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px" }}>
                      {i + 1}. {qText}
                    </h3>
                    <span className={`badge ${isCorrect ? "badge-success" : "badge-danger"}`}>
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                  </div>

                  <div style={{ background: "var(--color-elevated)", padding: "12px 16px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
                    <div style={{ marginBottom: "6px" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Your Answer: </span>
                      <strong style={{ color: isCorrect ? "var(--color-success)" : "var(--color-danger)" }}>
                        {studentAnswer}
                      </strong>
                    </div>
                    {!isCorrect && correctAnswer && (
                      <div>
                        <span style={{ color: "var(--color-text-muted)" }}>Correct Answer: </span>
                        <strong style={{ color: "var(--color-success)" }}>
                          {correctAnswer}
                        </strong>
                      </div>
                    )}
                  </div>

                  {explanation && (
                    <div className="review-explanation">
                      <strong>Diagnostic Explanation:</strong> {explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
