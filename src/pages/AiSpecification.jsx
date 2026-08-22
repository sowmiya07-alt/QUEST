import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/terminal.css";

const ASCII_BANNER = `
 ██████╗ ██╗   ██╗███████╗███████╗████████╗   █████╗ ██╗
██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝  ██╔══██╗██║
██║   ██║██║   ██║█████╗  ███████╗   ██║     ███████║██║
██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║     ██╔══██║██║
╚██████╔╝╚██████╔╝███████╗███████║   ██║     ██║  ██║██║
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ██║     ╚═╝  ╚═╝╚═╝
`;

export default function AiSpecification() {
  const { quizId } = useParams();
  const { quizzes, addQuiz } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([
    { type: "system", text: "Initializing QUEST AI specification engine..." },
    { type: "system", text: "Loading prompt synthesis modules..." },
    { type: "progress", text: "[██████████████████████████████] done" },
    { type: "system", text: "Resolving taxonomies & rubrics ... ok" },
    { type: "ready", text: "✦ quest.ai v2.4 — ready. Enter a topic prompt or /help command." }
  ]);

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const cmd = input.trim();
    setInput("");

    // Command handling
    if (cmd === "/clear") {
      setLogs([]);
      return;
    }

    if (cmd === "/help") {
      setLogs((prev) => [
        ...prev,
        { type: "prompt", text: `> /help` },
        { type: "system", text: "Available QUEST CLI Commands:" },
        { type: "output", text: "  /generate <topic>       - Synthesize quiz assessment from topic" },
        { type: "output", text: "  /difficulty <level>     - Set difficulty (easy | medium | tough)" },
        { type: "output", text: "  /clear                  - Clear terminal screen" },
        { type: "output", text: "  /help                   - Show command documentation" },
        { type: "output", text: "  Or directly type any topic name e.g. 'Operating Systems Caching'" }
      ]);
      return;
    }

    if (cmd.startsWith("/difficulty")) {
      const level = cmd.split(" ")[1];
      if (["easy", "medium", "tough"].includes(level?.toLowerCase())) {
        const formatted = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
        setDifficulty(formatted);
        setLogs((prev) => [
          ...prev,
          { type: "prompt", text: `> ${cmd}` },
          { type: "success", text: `✔ Difficulty updated to [${formatted}]` }
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          { type: "prompt", text: `> ${cmd}` },
          { type: "error", text: "Error: Difficulty must be 'easy', 'medium', or 'tough'" }
        ]);
      }
      return;
    }

    // Direct topic or /generate execution
    const topicPrompt = cmd.startsWith("/generate") ? cmd.replace("/generate", "").trim() : cmd;
    if (!topicPrompt) return;

    setLogs((prev) => [
      ...prev,
      { type: "prompt", text: `> quest-ai generate --spec "${topicPrompt}" --difficulty ${difficulty}` },
      { type: "system", text: "Analyzing domain concepts & synthesizing rubrics..." }
    ]);

    setIsGenerating(true);

    setTimeout(() => {
      const generatedQuestions = [
        {
          id: "ai-1",
          question: `In context of ${topicPrompt}: What is the primary bottleneck in large scale architecture?`,
          options: ["Network IO & Serialization", "L1 CPU Cache Hit", "RAM Allocation", "Registers"],
          correctIndex: 0,
          explanation: "Network IO and data serialization typically dominate distributed request latency overhead."
        },
        {
          id: "ai-2",
          question: `Which architectural pattern guarantees eventual consistency for ${topicPrompt}?`,
          options: ["Saga Pattern", "Strict Two-Phase Commit", "Monolithic Lock", "Synchronous RPC"],
          correctIndex: 0,
          explanation: "The Saga pattern uses compensating transactions to maintain consistency across asynchronous microservices."
        },
        {
          id: "ai-3",
          question: "Which operational metric best measures cache effectiveness?",
          options: ["Hit Ratio", "Page Fault Rate", "Disk Utilization", "Core Temperature"],
          correctIndex: 0,
          explanation: "Hit ratio measures the proportion of incoming read requests served directly from memory cache."
        }
      ];

      const quizCode = "AI" + Math.floor(1000 + Math.random() * 9000);
      const generatedQuiz = {
        id: "q-ai-" + Date.now(),
        code: quizCode,
        title: topicPrompt.length > 40 ? topicPrompt.slice(0, 40) + "..." : topicPrompt,
        description: `Auto-generated assessment via AI Terminal for prompt: "${topicPrompt}"`,
        difficulty: difficulty,
        timeLimit: 15,
        createdDate: new Date().toISOString().split("T")[0],
        assigned: true,
        questionsCount: generatedQuestions.length,
        questions: generatedQuestions
      };

      addQuiz(generatedQuiz);
      setIsGenerating(false);

      setLogs((prev) => [
        ...prev,
        { type: "success", text: `✔ Assessment generated successfully! Reference Code: ${generatedQuiz.code}` },
        { type: "system", text: "Redirecting to Quiz Generated Page in 1.5 seconds..." }
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
        <div className="terminal-page-container">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/staff/dashboard")}
            style={{ marginBottom: "16px" }}
          >
            ← Back to Staff Dashboard
          </button>

          {/* Terminal Window Frame */}
          <div className="terminal-window">
            {/* macOS Window Title Bar */}
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red" />
                <span className="terminal-dot dot-yellow" />
                <span className="terminal-dot dot-green" />
              </div>
              <span className="terminal-title">teacher@quest ~ /specification-terminal</span>
              <div />
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
              {/* Top ASCII Banner Header */}
              <div className="terminal-ascii-banner">{ASCII_BANNER}</div>

              {/* Side-by-Side Capabilities & Commands Grid (Reference Image 2) */}
              <div className="terminal-grid">
                <div className="terminal-grid-card">
                  <div className="terminal-grid-title">System Capabilities</div>
                  <div className="terminal-row">
                    <span className="terminal-label">Engine:</span>
                    <span className="terminal-val">QUEST AI Specification Kernel v2.4</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-label">Difficulty:</span>
                    <span className="terminal-val" style={{ color: "#FAB387" }}>{difficulty}</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-label">Status:</span>
                    <span className="terminal-val" style={{ color: "#A6E3A1" }}>Operational</span>
                  </div>
                </div>

                <div className="terminal-grid-card">
                  <div className="terminal-grid-title">Quick CLI Navigation</div>
                  <div className="terminal-row">
                    <span className="terminal-cmd-highlight" onClick={() => setInput("/generate React Hooks")}>
                      /generate &lt;topic&gt;
                    </span>
                    <span className="terminal-label">Synthesize quiz</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-cmd-highlight" onClick={() => setInput("/difficulty tough")}>
                      /difficulty &lt;level&gt;
                    </span>
                    <span className="terminal-label">Set easy/medium/tough</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-cmd-highlight" onClick={() => setInput("/help")}>
                      /help
                    </span>
                    <span className="terminal-label">Show docs</span>
                  </div>
                </div>
              </div>

              {/* Console Logs */}
              {logs.map((log, i) => (
                <div key={i} className="terminal-line">
                  {log.type === "prompt" && <span className="terminal-prompt">&gt;</span>}
                  <span
                    className={
                      log.type === "prompt"
                        ? "terminal-output"
                        : log.type === "success"
                        ? "terminal-success"
                        : log.type === "ready"
                        ? "terminal-ready"
                        : log.type === "progress"
                        ? "terminal-progress-track"
                        : "terminal-system"
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Command Prompt Bar */}
            <form onSubmit={handleCommandSubmit} className="terminal-input-bar">
              <span className="terminal-input-prompt-symbol">&gt;</span>
              <input
                className="terminal-input-field"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Type a command ... try "/generate React State" or "/help"'
                disabled={isGenerating}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isGenerating}>
                {isGenerating ? "Synthesizing..." : "Execute →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
