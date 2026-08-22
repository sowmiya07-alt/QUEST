import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function QuizPreview() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quizzes, deleteQuiz } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState("");

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("Medium");
  const [editTimeLimit, setEditTimeLimit] = useState(15);

  const handleDeleteQuiz = () => {
    if (window.confirm(`Are you sure you want to delete quiz "${quiz?.title || "Assessment"}"?`)) {
      deleteQuiz(quizId);
      navigate("/staff/dashboard");
    }
  };

  const fetchQuizPreview = () => {
    if (!quizId) return;
    setLoading(true);
    setError("");
    const match = (quizzes || []).find(q => String(q.id) === String(quizId) || String(q.quiz_id) === String(quizId));
    if (match) {
      setQuiz(match);
    } else {
      setError("Quiz not found.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizPreview();
  }, [quizId, quizzes]);

  const handleActivate = () => {
    if (!quiz) return;
    quiz.status = "ACTIVE";
    quiz.assigned = true;
    setQuiz({ ...quiz, status: "ACTIVE", assigned: true });
    setActionSuccessToast("✔ Quiz activated & assigned for student attempts!");
    setTimeout(() => setActionSuccessToast(""), 3000);
  };

  const handleClose = () => {
    if (!quiz) return;
    quiz.status = "CLOSED";
    quiz.assigned = false;
    setQuiz({ ...quiz, status: "CLOSED", assigned: false });
    setActionSuccessToast("✔ Quiz closed.");
    setTimeout(() => setActionSuccessToast(""), 3000);
  };

  const handleCopyReferenceCode = () => {
    const code = quiz?.code || quiz?.quiz_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCodeToast(true);
      setTimeout(() => setCopiedCodeToast(false), 2000);
    }
  };

  const startEditing = () => {
    if (quiz) {
      setEditTitle(quiz.title || "");
      setEditDifficulty(quiz.difficulty || "Medium");
      setEditTimeLimit(quiz.timeLimit || quiz.time_limit || 15);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    const updated = {
      ...quiz,
      title: editTitle.trim(),
      difficulty: editDifficulty,
      timeLimit: parseInt(editTimeLimit, 10) || 15,
      time_limit: parseInt(editTimeLimit, 10) || 15
    };
    setQuiz(updated);
    const matchInLocal = (quizzes || []).find(q => String(q.id) === String(quizId));
    if (matchInLocal) {
      matchInLocal.title = updated.title;
      matchInLocal.difficulty = updated.difficulty;
      matchInLocal.timeLimit = updated.timeLimit;
    }
    setIsEditing(false);
    setActionSuccessToast("✔ Quiz details updated successfully!");
    setTimeout(() => setActionSuccessToast(""), 3000);
  };

  const handleDownloadQuiz = () => {
    if (!quiz) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `${(quiz.title || "quiz").replace(/[^a-z0-9]/gi, "_")}_spec.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Helper to normalize questions array
  const normalizeQuestions = (rawQuestions = []) => {
    return rawQuestions.map((q, idx) => {
      const qText = q.question_text || q.question || `Question ${idx + 1}`;
      let options = [];
      if (Array.isArray(q.options)) {
        options = q.options;
      } else {
        options = [
          q.option_a || "Option A",
          q.option_b || "Option B",
          q.option_c || "Option C",
          q.option_d || "Option D"
        ].filter(Boolean);
      }

      // Resolve correct answer indicator
      let correctDisplay = q.correct_answer || q.correctAnswer;
      if (typeof q.correctIndex === "number") {
        correctDisplay = `Option ${String.fromCharCode(65 + q.correctIndex)}: ${options[q.correctIndex] || ""}`;
      }

      return {
        id: q.id || idx,
        question: qText,
        options,
        correct_answer: correctDisplay,
        explanation: q.explanation || ""
      };
    });
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Loading quiz preview from server...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>{error || "Quiz not found."}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
              <button className="btn btn-secondary btn-sm" onClick={fetchQuizPreview}>Retry</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/staff/dashboard")}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const questions = normalizeQuestions(quiz.questions || []);
  const quizCode = quiz.code || quiz.quiz_code || "DRAFT";
  const isQuizActive = quiz.status === "ACTIVE" || quiz.is_active;
  const isQuizClosed = quiz.status === "CLOSED";

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

        {/* Action Header bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                CODE: {quizCode}
              </span>
              <span className="badge badge-neutral" style={{ textTransform: "uppercase" }}>
                {quiz.difficulty || "MEDIUM"} DIFFICULTY
              </span>
              <span className={`badge ${isQuizActive ? "badge-success" : isQuizClosed ? "badge-danger" : "badge-neutral"}`}>
                ● {quiz.status || (isQuizActive ? "ACTIVE" : "DRAFT")}
              </span>
            </div>

            {isEditing ? (
              <div className="card" style={{ padding: "16px", marginTop: "8px", maxWidth: "500px" }}>
                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="label">Quiz Title</label>
                  <input
                    className="input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="input"
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Tough">Tough</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Time Limit (mins)</label>
                    <input
                      className="input"
                      type="number"
                      value={editTimeLimit}
                      onChange={(e) => setEditTimeLimit(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "28px" }}>{quiz.title}</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  {quiz.description || "Review questions, manage active status, and share reference code with students."}
                </p>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {quizCode && quizCode !== "DRAFT" && (
              <button className="btn btn-secondary btn-md" onClick={handleCopyReferenceCode}>
                {copiedCodeToast ? "✓ Code Copied!" : `📋 Copy Code (${quizCode})`}
              </button>
            )}

            {!isEditing && (
              <button className="btn btn-secondary btn-md" onClick={startEditing}>
                ✏️ Edit Quiz
              </button>
            )}

            <button className="btn btn-secondary btn-md" onClick={handleDownloadQuiz}>
              📥 Download Spec
            </button>

            {!isQuizActive && !isQuizClosed && (
              <button
                className="btn btn-primary btn-md"
                onClick={handleActivate}
                disabled={actionLoading}
              >
                {actionLoading ? "Assigning..." : "⚡ Assign Quiz"}
              </button>
            )}

            {isQuizActive && (
              <button
                className="btn btn-danger btn-md"
                onClick={handleClose}
                disabled={actionLoading}
              >
                {actionLoading ? "Closing..." : "✕ Close Quiz"}
              </button>
            )}

            <Link to={`/staff/quiz/${quizId}/results`} className="btn btn-secondary btn-md">
              📊 View Results
            </Link>

            <button className="btn btn-ghost btn-md" style={{ color: "#ff4d4f", borderColor: "rgba(255,77,79,0.3)" }} onClick={handleDeleteQuiz}>
              🗑️ Delete Quiz
            </button>
          </div>
        </div>

        {actionSuccessToast && (
          <div className="badge badge-success" style={{ padding: "10px 16px", marginBottom: "16px", display: "block" }}>
            {actionSuccessToast}
          </div>
        )}

        {/* Reference Code Card Banner */}
        <div className="card" style={{ marginBottom: "24px", background: "var(--color-elevated)", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Student Access Reference Code
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "26px", color: "var(--color-accent)", fontWeight: "bold", marginTop: "2px" }}>
                {quizCode}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Status: <strong style={{ color: isQuizActive ? "var(--color-success)" : "inherit" }}>{quiz.status || "DRAFT"}</strong>
              </p>
              {isQuizActive && (
                <span className="badge badge-success" style={{ marginTop: "4px" }}>
                  Ready for student attempts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Questions Verification List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px" }}>Questions ({questions.length})</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.length === 0 ? (
            <div className="card empty-state">
              <p>No questions generated for this assessment yet.</p>
              <Link to={`/staff/quiz/${quizId}/terminal`} className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }}>
                Generate with AI Specification
              </Link>
            </div>
          ) : (
            questions.map((q, qIdx) => (
              <div key={q.id || qIdx} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px" }}>
                    {qIdx + 1}. {q.question}
                  </h3>
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isCorrect =
                      String(q.correct_answer).toLowerCase().includes(`option_${letter.toLowerCase()}`) ||
                      String(q.correct_answer).toLowerCase().includes(`option ${letter.toLowerCase()}`) ||
                      String(q.correct_answer).trim() === opt.trim();

                    return (
                      <div
                        key={oIdx}
                        className={`option-btn ${isCorrect ? "correct" : ""}`}
                        style={{ cursor: "default" }}
                      >
                        <span className="option-indicator">{letter}</span>
                        <span>{opt}</span>
                        {isCorrect && <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓ Correct Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {q.correct_answer && (
                  <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
                    <strong>Correct Answer:</strong> {q.correct_answer}
                  </div>
                )}

                {q.explanation && (
                  <div className="review-explanation" style={{ marginTop: "8px" }}>
                    <strong>Diagnostic Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
