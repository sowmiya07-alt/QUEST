import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function AiSpecification() {
  const { quizId } = useParams();
  const { quizzes, addQuiz } = useAuth();
  const navigate = useNavigate();

  const existingQuiz = quizzes.find((q) => q.id === quizId);
  const [logs, setLogs] = useState([
    { type: "system", text: "QUEST AI Specification Engine v2.4 initialized." },
    { type: "system", text: "Type target topic or prompt specification to generate automated quiz schema." },
    { type: "system", text: "Try: 'generate 3 questions on System Architecture and Caching'" }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const cmd = input.trim();
    setInput("");

    setLogs((prev) => [
      ...prev,
      { type: "prompt", text: `$ quest-ai generate --spec "${cmd}"` },
      { type: "system", text: "Analyzing domain concepts & synthesizing rubrics..." }
    ]);

    setIsGenerating(true);

    setTimeout(() => {
      const generatedQuiz = {
        id: "q-ai-" + Date.now(),
        code: "AI" + Math.floor(1000 + Math.random() * 9000),
        title: `AI Spec: ${cmd.slice(0, 30)}...`,
        description: `Auto-generated assessment for prompt specification: "${cmd}"`,
        timeLimit: 15,
        createdDate: new Date().toISOString().split("T")[0],
        questionsCount: 3,
        questions: [
          {
            id: "ai-1",
            question: `In context of ${cmd}, what is the main latency bottleneck?`,
            options: ["Network IO & serialization", "L1 Cache hit", "RAM Allocation", "Registers"],
            correctIndex: 0,
            explanation: "Network IO and serialization typically dominate distributed request overhead."
          },
          {
            id: "ai-2",
            question: "Which pattern guarantees eventual consistency across distributed nodes?",
            options: ["Saga Pattern", "Strict Two-Phase Commit", "Monolithic Lock", "Synchronous RPC"],
            correctIndex: 0,
            explanation: "Sagas use compensating transactions to achieve eventual consistency asynchronously."
          },
          {
            id: "ai-3",
            question: "What metric best indicates cache effectiveness?",
            options: ["Hit Ratio", "Page Fault Rate", "Disk Utilization", "Core Temperature"],
            correctIndex: 0,
            explanation: "Hit ratio measures the proportion of requests served directly from cache."
          }
        ]
      };

      addQuiz(generatedQuiz);
      setIsGenerating(false);

      setLogs((prev) => [
        ...prev,
        { type: "success", text: `✔ Assessment generated successfully! Quiz Code: ${generatedQuiz.code}` },
        { type: "system", text: "Redirecting to preview page in 2 seconds..." }
      ]);

      setTimeout(() => {
        navigate(`/staff/quiz/${generatedQuiz.id}/preview`);
      }, 1500);
    }, 1200);
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

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px" }}>AI Terminal Specification Engine</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Generate assessments via CLI prompts or import raw JSON specifications.
          </p>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot dot-red" />
              <span className="terminal-dot dot-yellow" />
              <span className="terminal-dot dot-green" />
            </div>
            <span className="terminal-title">quest-ai-cli ~ bash</span>
            <div style={{ width: 40 }} />
          </div>

          <div className="terminal-body">
            {logs.map((log, i) => (
              <div key={i} className="terminal-line">
                {log.type === "prompt" && <span className="terminal-prompt">&gt;</span>}
                <span
                  className={
                    log.type === "prompt"
                      ? "terminal-output"
                      : log.type === "success"
                      ? "terminal-success"
                      : "terminal-system"
                  }
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommandSubmit} style={{ padding: "12px 16px", background: "#0E1216", borderTop: "1px solid var(--color-border)" }}>
            <div className="terminal-input-row">
              <span className="terminal-prompt">$</span>
              <input
                className="terminal-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter prompt e.g. 'generate quiz on React Hooks'..."
                disabled={isGenerating}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isGenerating}>
                {isGenerating ? "Synthesizing..." : "Execute →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
