import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quizService } from "../services/quizService";
import Navbar from "../components/Navbar";

export default function AiSpecification() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([
    { type: "system", text: "QUEST AI Specification Engine initialized." },
    { type: "system", text: "Connected to Django backend FBV engine." },
    { type: "system", text: "Click 'Generate AI Specification' or enter prompt to synthesize JSON schema from backend." }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSpecification = async (customPrompt = "") => {
    if (!quizId) {
      setError("No active quiz ID provided. Please create a quiz assessment first.");
      return;
    }

    setError("");
    setIsGenerating(true);

    const promptText = customPrompt || input.trim() || "Default assessment specification";
    setInput("");

    setLogs((prev) => [
      ...prev,
      { type: "prompt", text: `$ quest-ai generate --quiz-id ${quizId} --spec "${promptText}"` },
      { type: "system", text: "Transmitting specification payload to Django backend..." }
    ]);

    try {
      const res = await quizService.generateAISpecification(quizId, {
        prompt: promptText
      });

      const specData = res?.specification || res?.data || res?.spec || res;
      const specString = typeof specData === "object" ? JSON.stringify(specData, null, 2) : String(specData);
      setGeneratedSpec(specString);

      setLogs((prev) => [
        ...prev,
        { type: "success", text: "✔ Django backend synthesized AI specification JSON successfully." },
        { type: "system", text: "--- BEGIN AI SPECIFICATION PAYLOAD ---" },
        { type: "output", text: specString },
        { type: "system", text: "--- END AI SPECIFICATION PAYLOAD ---" }
      ]);
    } catch (err) {
      console.error("[AiSpecification] Generation error:", err);
      const errMsg = err.message || "Failed to generate AI specification from backend.";
      setError(errMsg);
      setLogs((prev) => [
        ...prev,
        { type: "error", text: `✖ Error: ${errMsg}` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySpec = () => {
    if (!generatedSpec) return;
    navigator.clipboard.writeText(generatedSpec);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/staff/dashboard")}
          >
            ← Back to Staff Dashboard
          </button>
          {quizId && (
            <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)" }}>
              Assessment ID: #{quizId}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px" }}>AI Terminal Specification Engine</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Generates backend-aligned JSON specifications for external AI models or automated imports.
          </p>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

        {/* Action Controls */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleGenerateSpecification()}
              disabled={isGenerating || !quizId}
            >
              {isGenerating ? "Synthesizing..." : "⚡ Generate AI Specification"}
            </button>
            {generatedSpec && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopySpec}
              >
                {copiedToast ? "✓ Copied JSON!" : "📋 Copy JSON Specification"}
              </button>
            )}
            {quizId && (
              <Link to={`/staff/quiz/${quizId}/import`} className="btn btn-secondary btn-sm">
                📥 Import External AI JSON →
              </Link>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled
              title="Built-in Claude API endpoint is pending on Django backend. Use External AI workflow."
              style={{ opacity: 0.6, cursor: "not-allowed", border: "1px dashed var(--color-border)" }}
            >
              🤖 Run with Claude (Direct API Unavailable)
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot dot-red" />
              <span className="terminal-dot dot-yellow" />
              <span className="terminal-dot dot-green" />
            </div>
            <span className="terminal-title">quest-ai-cli ~ FBV Backend Session</span>
            <div style={{ width: 40 }} />
          </div>

          <div className="terminal-body" style={{ maxHeight: "450px", overflowY: "auto" }}>
            {logs.map((log, i) => (
              <div key={i} className="terminal-line">
                {log.type === "prompt" && <span className="terminal-prompt">&gt;</span>}
                <span
                  className={
                    log.type === "prompt"
                      ? "terminal-output"
                      : log.type === "success"
                      ? "terminal-success"
                      : log.type === "error"
                      ? "badge-danger"
                      : "terminal-system"
                  }
                  style={log.type === "output" ? { fontFamily: "var(--font-mono)", fontSize: "12px", whiteSpace: "pre-wrap", display: "block", color: "var(--color-accent)", margin: "8px 0" } : {}}
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) handleGenerateSpecification(input.trim());
            }}
            style={{ padding: "12px 16px", background: "#0E1216", borderTop: "1px solid var(--color-border)" }}
          >
            <div className="terminal-input-row">
              <span className="terminal-prompt">$</span>
              <input
                className="terminal-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter prompt e.g. 'Generate 5 questions on Distributed Systems'..."
                disabled={isGenerating || !quizId}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isGenerating || !quizId}
              >
                {isGenerating ? "Executing..." : "Execute →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
