import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ImportAiQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quizzes, addQuiz } = useAuth();

  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = (e) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    if (!quizId) {
      setError("No active quiz ID found. Please create an assessment first.");
      return;
    }

    setError("");
    setLoading(true);
    setStatusMessage("Validating AI JSON payload...");

    let payload;
    try {
      let cleaned = jsonText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
      }
      payload = JSON.parse(cleaned);
    } catch (parseErr) {
      setError("Invalid JSON format: " + parseErr.message + ". Please copy the raw JSON response from Claude or ChatGPT.");
      setLoading(false);
      return;
    }

    const rawQs = payload.questions || (Array.isArray(payload) ? payload : []);
    let targetQuiz = (quizzes || []).find((q) => String(q.id) === String(quizId));

    if (!targetQuiz) {
      const generatedCode = "QUIZ-" + Math.floor(1000 + Math.random() * 9000);
      targetQuiz = {
        id: quizId,
        code: generatedCode,
        title: payload.title || "AI Generated Quiz",
        difficulty: payload.difficulty || "Medium",
        questionsCount: rawQs.length,
        status: "ACTIVE",
        assigned: true,
        questions: rawQs
      };
      addQuiz(targetQuiz);
    } else {
      if (rawQs.length > 0) {
        targetQuiz.questions = rawQs;
        targetQuiz.questionsCount = rawQs.length;
      }
      targetQuiz.status = "ACTIVE";
      targetQuiz.assigned = true;
    }

    setStatusMessage("✔ Quiz assessment generated successfully! Redirecting...");
    setTimeout(() => {
      navigate(`/staff/quiz/${quizId}/preview`);
    }, 600);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "800px" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/staff/quiz/${quizId}/terminal`)}
          style={{ marginBottom: "16px" }}
          disabled={loading}
        >
          ← Back to Specification Prompt
        </button>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="badge badge-accent">Step 3 of 3 • AI Response Importer</span>
            {quizId && <span className="badge badge-neutral">Assessment #{quizId}</span>}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800" }}>Paste AI Response & Generate Quiz</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Paste the JSON response from Claude, ChatGPT, or Gemini into the terminal box below, then click <strong>Generate Quiz</strong>.
          </p>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

        <div className="card" style={{ padding: "28px 32px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "36px" }}>
              <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
              <p style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: "15px" }}>
                {statusMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label className="label">Paste AI JSON Response *</label>
                <textarea
                  className="json-input"
                  rows={14}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setError("");
                  }}
                  placeholder='Paste AI JSON response here e.g. { "questions": [ { "question_text": "...", "option_a": "...", ... } ] }'
                  required
                  style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => navigate(`/staff/quiz/${quizId}/terminal`)}
                >
                  ← View Specification Prompt
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  ⚡ Generate Quiz
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
