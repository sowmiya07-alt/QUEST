import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import staffService from "../services/staffService";
import Navbar from "../components/Navbar";

export default function ImportAiQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    if (!quizId) {
      setError("No active quiz ID found. Please create an assessment first.");
      return;
    }

    setError("");
    setLoading(true);
    setStatusMessage("Validating & importing AI JSON payload to server...");

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

    try {
      await staffService.importAiQuiz(quizId, payload);

      setStatusMessage("✔ Quiz assessment questions imported successfully! Redirecting to preview...");
      setTimeout(() => {
        navigate(`/staff/quiz/${quizId}/preview`);
      }, 600);
    } catch (err) {
      console.error("[ImportAiQuiz] Error importing questions:", err);
      setError(err.message || "Failed to import AI questions to QUEST server.");
      setLoading(false);
    }
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
                  placeholder='Paste AI JSON response here e.g. { "title": "...", "questions": [ { "question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "option_a", "explanation": "..." } ] }'
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
                  ⚡ Import & Generate Quiz
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
