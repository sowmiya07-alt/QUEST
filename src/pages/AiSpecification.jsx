import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import staffService from "../services/staffService";
import Navbar from "../components/Navbar";

export default function AiSpecification() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [specData, setSpecData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSpecification() {
      if (!quizId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await staffService.generateAiSpecification(quizId, {});
        setSpecData(res);
      } catch (err) {
        console.warn("[AiSpecification] Note from server:", err.message);
        // If preview is available, fetch details to show accurate specification
        try {
          const preview = await staffService.getQuizPreview(quizId);
          setSpecData({
            title: preview.title || "Assessment Specification",
            difficulty: preview.difficulty || "Medium",
            questions_count: preview.questions_count || 5,
            prompt: preview.ai_prompt || preview.specification
          });
        } catch {
          setError(err.message || "Failed to generate AI specification.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadSpecification();
  }, [quizId]);

  const quizTitle = specData?.title || specData?.quiz_title || "Quiz Assessment";
  const difficulty = specData?.difficulty || "Medium";
  const questionCount = specData?.question_count || specData?.questions_count || 5;

  const promptText =
    typeof specData?.prompt === "string"
      ? specData.prompt
      : specData?.ai_specification
      ? typeof specData.ai_specification === "string"
        ? specData.ai_specification
        : JSON.stringify(specData.ai_specification, null, 2)
      : specData?.specification
      ? typeof specData.specification === "string"
        ? specData.specification
        : JSON.stringify(specData.specification, null, 2)
      : `Generate a ${questionCount}-question multiple choice quiz on topic "${quizTitle}" with ${difficulty} difficulty.

Please return ONLY a raw JSON object matching this exact schema:
{
  "title": "${quizTitle}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question_text": "Write clear question text here...",
      "option_a": "First option text",
      "option_b": "Second option text",
      "option_c": "Third option text",
      "option_d": "Fourth option text",
      "correct_answer": "option_a",
      "explanation": "Diagnostic explanation for the correct answer."
    }
  ]
}`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "800px" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/staff/dashboard")}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Staff Dashboard
        </button>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-accent">Step 2 of 3 • AI Prompt Specification</span>
            {quizId && <span className="badge badge-neutral">Assessment #{quizId}</span>}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800" }}>Generated AI Specification Prompt</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Copy the prompt below and paste it into any AI model (Claude, ChatGPT, Gemini). Then return and paste the AI response to generate your quiz.
          </p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
              Synthesizing AI specification prompt...
            </p>
          </div>
        ) : (
          <>
            {/* Clean Prompt Display Card */}
            <div className="card" style={{ padding: "28px 32px", marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <strong style={{ fontSize: "15px" }}>{quizTitle} Specification</strong>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className={`btn ${copied ? "btn-secondary" : "btn-primary"} btn-md`}
                    onClick={handleCopyPrompt}
                    style={{ fontWeight: "700" }}
                  >
                    {copied ? "✓ Copied to Clipboard!" : "📋 Copy JSON Specification"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-elevated, #0e1216)",
                  border: "1px solid var(--color-border, #2a2f3a)",
                  borderRadius: "8px",
                  padding: "20px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "var(--color-accent, #646cff)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "360px",
                  overflowY: "auto"
                }}
              >
                {promptText}
              </div>
            </div>

            {/* Step Guide & Next Action Button */}
            <div
              className="card"
              style={{
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                background: "var(--color-elevated)"
              }}
            >
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>
                  Ready to import your quiz questions?
                </div>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
                  After copying and running the prompt in your external AI tool, click below to paste the returned JSON.
                </p>
              </div>

              <Link to={`/staff/quiz/${quizId}/import`} className="btn btn-primary btn-lg">
                Next: Import AI JSON Response →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
