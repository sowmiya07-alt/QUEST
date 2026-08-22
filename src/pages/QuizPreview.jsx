import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function QuizPreview() {
  const { quizId } = useParams();
  const { quizzes, updateQuiz } = useAuth();
  const navigate = useNavigate();

  const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0];

  // Local editing state for Verify & Modify
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState(null);
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  useEffect(() => {
    if (quiz) {
      setEditedQuiz(JSON.parse(JSON.stringify(quiz)));
    }
  }, [quiz]);

  if (!quiz || !editedQuiz) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>Quiz not found.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/staff/dashboard")}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleCopyReferenceCode = () => {
    navigator.clipboard.writeText(editedQuiz.code);
    setCopiedCodeToast(true);
    setTimeout(() => setCopiedCodeToast(false), 2000);
  };

  const handleQuestionTextChange = (idx, text) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[idx].question = text;
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIdx, oIdx, text) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[qIdx].options[oIdx] = text;
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const handleCorrectIndexChange = (qIdx, oIdx) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[qIdx].correctIndex = oIdx;
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const handleExplanationChange = (qIdx, text) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[qIdx].explanation = text;
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      question: "New Custom Question Statement",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctIndex: 0,
      explanation: "Add explanation..."
    };
    setEditedQuiz({
      ...editedQuiz,
      questions: [...editedQuiz.questions, newQ],
      questionsCount: editedQuiz.questions.length + 1
    });
  };

  const handleDeleteQuestion = (qIdx) => {
    const updatedQuestions = editedQuiz.questions.filter((_, idx) => idx !== qIdx);
    setEditedQuiz({
      ...editedQuiz,
      questions: updatedQuestions,
      questionsCount: updatedQuestions.length
    });
  };

  const handleSaveChanges = () => {
    updateQuiz(quiz.id, {
      ...editedQuiz,
      questionsCount: editedQuiz.questions.length
    });
    setIsEditing(false);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  const handleToggleAssign = () => {
    const newAssignedStatus = !editedQuiz.assigned;
    setEditedQuiz({ ...editedQuiz, assigned: newAssignedStatus });
    updateQuiz(quiz.id, { assigned: newAssignedStatus });
  };

  // Download Quiz as JSON
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editedQuiz, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${editedQuiz.code}_${editedQuiz.title.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Quiz as Printable TXT
  const handleDownloadTXT = () => {
    let txt = `========================================================\n`;
    txt += `QUIZ ASSESSMENT: ${editedQuiz.title}\n`;
    txt += `REFERENCE CODE: ${editedQuiz.code} | DIFFICULTY: ${editedQuiz.difficulty || "Medium"}\n`;
    txt += `TIME LIMIT: ${editedQuiz.timeLimit} MINUTES | TOTAL QUESTIONS: ${editedQuiz.questions.length}\n`;
    txt += `========================================================\n\n`;

    editedQuiz.questions.forEach((q, idx) => {
      txt += `Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        txt += `   [${letter}] ${opt}\n`;
      });
      txt += `   Answer: Option ${String.fromCharCode(65 + q.correctIndex)}\n`;
      if (q.explanation) txt += `   Explanation: ${q.explanation}\n`;
      txt += `\n--------------------------------------------------------\n\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${editedQuiz.code}_Printable.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
                CODE: {editedQuiz.code}
              </span>
              <span className="badge badge-neutral">
                {editedQuiz.difficulty ? `${editedQuiz.difficulty} Difficulty` : "Medium"}
              </span>
              <span className={`badge ${editedQuiz.assigned ? "badge-success" : "badge-neutral"}`}>
                {editedQuiz.assigned ? "● Assigned to Students" : "Draft"}
              </span>
            </div>
            <h1 style={{ fontSize: "28px" }}>Quiz Generated: {editedQuiz.title}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Verify, edit questions, assign reference code to students, or download offline.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-md" onClick={handleCopyReferenceCode}>
              {copiedCodeToast ? "✓ Code Copied!" : `📋 Copy Code (${editedQuiz.code})`}
            </button>
            <button className="btn btn-secondary btn-md" onClick={handleToggleAssign}>
              {editedQuiz.assigned ? "Unassign Quiz" : "✓ Assign Quiz"}
            </button>
            <button className="btn btn-secondary btn-md" onClick={handleDownloadJSON}>
              ⬇ Download JSON
            </button>
            <button className="btn btn-secondary btn-md" onClick={handleDownloadTXT}>
              📄 Download TXT
            </button>
            {!isEditing ? (
              <button className="btn btn-primary btn-md" onClick={() => setIsEditing(true)}>
                ✏ Edit & Verify Questions
              </button>
            ) : (
              <button className="btn btn-primary btn-md" onClick={handleSaveChanges}>
                💾 Save Modifications
              </button>
            )}
          </div>
        </div>

        {saveSuccessToast && (
          <div className="badge badge-success" style={{ padding: "10px 16px", marginBottom: "16px", display: "block" }}>
            ✔ Quiz modifications successfully saved!
          </div>
        )}

        {/* Reference Code Card Banner */}
        <div className="card" style={{ marginBottom: "24px", background: "var(--color-elevated)", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Student Access Reference Code
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "26px", color: "var(--color-accent)", fontWeight: "bold", marginTop: "2px" }}>
                {editedQuiz.code}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Share this reference code with students to attempt the quiz.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/student/quiz/${editedQuiz.id}`)}
                style={{ marginTop: "4px" }}
              >
                Test Student Experience →
              </button>
            </div>
          </div>
        </div>

        {/* Questions Verification & Modification List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px" }}>Questions ({editedQuiz.questions.length})</h2>
          {isEditing && (
            <button className="btn btn-secondary btn-sm" onClick={handleAddQuestion}>
              + Add New Question
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {editedQuiz.questions.map((q, qIdx) => (
            <div key={q.id || qIdx} className="card">
              {!isEditing ? (
                /* READ-ONLY / VERIFY MODE */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px" }}>
                      {qIdx + 1}. {q.question}
                    </h3>
                  </div>

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
                    <div className="review-explanation" style={{ marginTop: "12px" }}>
                      <strong>Diagnostic Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT / MODIFY MODE */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <label className="label">Question #{qIdx + 1}</label>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteQuestion(qIdx)}
                    >
                      Delete Question
                    </button>
                  </div>

                  <div className="form-group">
                    <input
                      className="input"
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      placeholder="Enter question text..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Options (Mark correct answer radio)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === oIdx}
                            onChange={() => handleCorrectIndexChange(qIdx, oIdx)}
                            title="Mark as correct answer"
                          />
                          <input
                            className="input"
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Explanation for answer feedback</label>
                    <input
                      className="input"
                      type="text"
                      value={q.explanation || ""}
                      onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                      placeholder="Explanation provided to student after quiz..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-md" onClick={() => setIsEditing(false)}>
              Cancel Edits
            </button>
            <button className="btn btn-primary btn-md" onClick={handleSaveChanges}>
              💾 Save All Modifications
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
