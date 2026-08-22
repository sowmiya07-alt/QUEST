import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const { quizzes, addAttempt, user } = useAuth();
  const navigate = useNavigate();

  const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz?.timeLimit || 15) * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!quiz) return null;

  const currentQ = quiz.questions[currentIdx];
  const isLastQuestion = currentIdx === quiz.questions.length - 1;

  const handleSelectOption = (optIdx) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / quiz.questions.length) * 100);
    const attemptId = "att-" + Math.floor(100 + Math.random() * 900);

    const newAttempt = {
      attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: scorePct,
      total: quiz.questions.length,
      correctCount: correct,
      date: new Date().toLocaleString(),
      answers: userAnswers,
      studentCode: user?.code || "STU-9482"
    };

    addAttempt(newAttempt);
    navigate(`/student/result/${attemptId}`);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div className="quiz-container">
          <div className="quiz-header">
            <div>
              <span className="badge badge-accent">Quiz Code: {quiz.code}</span>
              <h2 style={{ fontSize: "18px", marginTop: "4px" }}>{quiz.title}</h2>
            </div>
            <div className="quiz-timer">
              ⏱ Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          <div className="question-card">
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "13px" }}>
              <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span>{Object.keys(userAnswers).length} answered</span>
            </div>

            <h2 className="question-title">{currentQ.question}</h2>

            <div className="options-grid">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQ.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(oIdx)}
                  >
                    <span className="option-indicator">{String.fromCharCode(65 + oIdx)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <button
                className="btn btn-secondary btn-md"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
              >
                ← Previous
              </button>

              {isLastQuestion ? (
                <button className="btn btn-primary btn-md" onClick={handleSubmitQuiz}>
                  Finish & Submit Assessment ✓
                </button>
              ) : (
                <button className="btn btn-primary btn-md" onClick={() => setCurrentIdx((prev) => prev + 1)}>
                  Next Question →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
