import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../services/studentService";
import Navbar from "../components/Navbar";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      try {
        setLoading(true);
        setError("");
        const res = await studentService.getQuiz(quizId);
        const data = res?.quiz || res?.data || res;
        setQuiz(data);

        const durationMinutes = data?.time_limit || data?.timeLimit || 15;
        setTimeLeft(durationMinutes * 60);
      } catch (err) {
        console.error("[TakeQuiz] Error loading quiz:", err);
        setError(err.message || "Failed to load quiz questions.");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || submitting) return;
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
  }, [quiz, submitting, userAnswers]);

  // Normalize questions for student viewing (sanitizing any correct answers)
  const normalizeQuestions = (rawQuestions = []) => {
    return rawQuestions.map((q, idx) => {
      const qId = q.id ?? idx + 1;
      const qText = q.question_text || q.question || `Question ${idx + 1}`;
      let options = [];
      if (Array.isArray(q.options)) {
        options = q.options.map((opt, oIdx) => ({
          key: `option_${String.fromCharCode(97 + oIdx)}`,
          label: String.fromCharCode(65 + oIdx),
          text: typeof opt === "string" ? opt : (opt.text || opt.label)
        }));
      } else {
        options = [
          { key: "option_a", label: "A", text: q.option_a || "Option A" },
          { key: "option_b", label: "B", text: q.option_b || "Option B" },
          { key: "option_c", label: "C", text: q.option_c || "Option C" },
          { key: "option_d", label: "D", text: q.option_d || "Option D" }
        ].filter(opt => !!opt.text);
      }

      return {
        id: qId,
        question: qText,
        options
      };
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      // Structure answers payload matching Django expectations
      const payload = {
        answers: userAnswers
      };

      const res = await studentService.submitQuiz(quizId, payload);
      const attemptId = res?.attempt_id || res?.id || res?.attempt?.id;

      if (attemptId) {
        navigate(`/student/result/${attemptId}`);
      } else {
        // Fallback to dashboard if attempt ID missing
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("[TakeQuiz] Submit error:", err);
      setError(err.message || "Failed to submit assessment answers.");
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading assessment questions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/student/dashboard")} style={{ marginTop: "12px" }}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const questions = normalizeQuestions(quiz?.questions || []);
  if (questions.length === 0) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>No questions found in this assessment.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/student/dashboard")} style={{ marginTop: "12px" }}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];
  const isLastQuestion = currentIdx === questions.length - 1;
  const currentSelection = userAnswers[currentQ.id];

  const handleSelectOption = (optionKey) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }));
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

        <div className="quiz-container">
          <div className="quiz-header">
            <div>
              {quiz?.code && (
                <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)" }}>
                  Quiz Code: {quiz.code}
                </span>
              )}
              <h2 style={{ fontSize: "18px", marginTop: "4px" }}>{quiz?.title || "Assessment"}</h2>
            </div>
            <div className="quiz-timer">
              ⏱ Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="question-card">
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "13px" }}>
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Object.keys(userAnswers).length} answered</span>
            </div>

            <h2 className="question-title">{currentQ.question}</h2>

            <div className="options-grid">
              {currentQ.options.map((opt) => {
                const isSelected = currentSelection === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(opt.key)}
                    disabled={submitting}
                  >
                    <span className="option-indicator">{opt.label}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <button
                className="btn btn-secondary btn-md"
                disabled={currentIdx === 0 || submitting}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
              >
                ← Previous
              </button>

              {isLastQuestion ? (
                <button
                  className="btn btn-primary btn-md"
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                >
                  {submitting ? "Submitting Quiz..." : "Finish & Submit Assessment ✓"}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-md"
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  disabled={submitting}
                >
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
