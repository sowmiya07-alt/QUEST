import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/terminal.css";

const IMPORT_ASCII_BANNER = `
 ██████╗ ██╗   ██╗███████╗███████╗████████╗   ██╗███╗   ███╗██████╗ ██████╗ ██████╗ ████████╗
██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝   ██║████╗ ████║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝
██║   ██║██║   ██║█████╗  ███████╗   ██║      ██║██╔████╔██║██████╔╝██║  ██║██████╔╝   ██║   
██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║      ██║██║╚██╔╝██║██╔═══╝ ██║  ██║██╔══██╗   ██║   
╚██████╔╝╚██████╔╝███████╗███████║   ██║      ██║██║ ╚═╝ ██║██║     ██████╔╝██║  ██║   ██║   
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ██║      ╚═╝╚═╝     ╚═╝╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
`;

const INITIAL_SAMPLE_JSON = JSON.stringify(
  {
    code: "DB301",
    title: "Database Indexing & Query Optimization",
    description: "Covers B-Trees, Hash Indexes, and Execution Plans",
    difficulty: "Tough",
    timeLimit: 15,
    questions: [
      {
        id: "imp-1",
        question: "Which index type is best suited for high cardinality range queries?",
        options: ["Hash Index", "B-Tree Index", "Bitmap Index", "Full-Text Index"],
        correctIndex: 1,
        explanation: "B-Trees maintain ordered key trees, enabling logarithmic O(log N) range scans."
      },
      {
        id: "imp-2",
        question: "What is the primary advantage of a Cover Index in SQL execution?",
        options: ["Eliminates table heap lookup entirely", "Encrypts column payloads", "Disables transaction logging", "Forces parallel CPU execution"],
        correctIndex: 0,
        explanation: "A covering index contains all queried columns, avoiding expensive table data page reads."
      }
    ]
  },
  null,
  2
);

export default function ImportAiQuiz() {
  const { addQuiz } = useAuth();
  const navigate = useNavigate();

  const [jsonText, setJsonText] = useState(INITIAL_SAMPLE_JSON);
  const [error, setError] = useState("");
  const [cliInput, setCliInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("✦ Schema Parser v2.4 initialized. Ready to validate and import payload.");

  const handleImport = (e) => {
    if (e) e.preventDefault();
    setError("");

    try {
      let parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        parsed = { questions: parsed };
      }

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("JSON payload must contain a valid 'questions' array.");
      }

      const newQuiz = {
        id: "q-imp-" + Date.now(),
        code: parsed.code || "IMP" + Math.floor(1000 + Math.random() * 9000),
        title: parsed.title || "Imported JSON Quiz",
        description: parsed.description || "Imported JSON assessment specification.",
        difficulty: parsed.difficulty || "Medium",
        timeLimit: parsed.timeLimit || 15,
        createdDate: new Date().toISOString().split("T")[0],
        assigned: true,
        questionsCount: parsed.questions.length,
        questions: parsed.questions
      };

      addQuiz(newQuiz);
      setStatusMsg("✔ Quiz JSON validated and imported! Redirecting to Quiz Generated Page...");

      setTimeout(() => {
        navigate(`/staff/quiz/${newQuiz.id}/preview`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid JSON formatting.");
    }
  };

  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    setCliInput("");

    if (cmd === "/validate" || cmd === "/import") {
      handleImport();
    } else if (cmd === "/sample") {
      setJsonText(INITIAL_SAMPLE_JSON);
      setError("");
      setStatusMsg("✔ Reloaded default JSON sample specification payload.");
    } else if (cmd === "/clear") {
      setJsonText("");
      setError("");
    } else {
      setStatusMsg(`Executed CLI: ${cmd}. Click 'Import Quiz' to parse JSON.`);
    }
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
              <span className="terminal-title">teacher@quest ~ /json-import-terminal</span>
              <div />
            </div>

            {/* Terminal Body */}
            <div className="terminal-body" style={{ minHeight: "520px" }}>
              {/* ASCII Header Banner */}
              <div className="terminal-ascii-banner" style={{ color: "#89B4FA" }}>
                {IMPORT_ASCII_BANNER}
              </div>

              {/* Side-by-Side Capabilities Grid */}
              <div className="terminal-grid">
                <div className="terminal-grid-card">
                  <div className="terminal-grid-title" style={{ color: "#89B4FA" }}>
                    JSON Schema Validator
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-label">Expected Keys:</span>
                    <span className="terminal-val">title, difficulty, timeLimit, questions</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-label">Status:</span>
                    <span className="terminal-val" style={{ color: "#A6E3A1" }}>Ready</span>
                  </div>
                </div>

                <div className="terminal-grid-card">
                  <div className="terminal-grid-title" style={{ color: "#89B4FA" }}>
                    CLI Commands
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-cmd-highlight" onClick={() => handleImport()}>
                      /import
                    </span>
                    <span className="terminal-label">Parse & Create Quiz</span>
                  </div>
                  <div className="terminal-row">
                    <span className="terminal-cmd-highlight" onClick={() => setJsonText(INITIAL_SAMPLE_JSON)}>
                      /sample
                    </span>
                    <span className="terminal-label">Load sample payload</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="terminal-line">
                <span className="terminal-ready">{statusMsg}</span>
              </div>

              {error && (
                <div className="terminal-line">
                  <span className="terminal-error">✖ Error: {error}</span>
                </div>
              )}

              {/* Textarea Code Payload */}
              <div style={{ marginTop: "8px" }}>
                <label className="terminal-label" style={{ display: "block", marginBottom: "6px" }}>
                  JSON Payload Specification Input:
                </label>
                <textarea
                  className="json-input"
                  rows={14}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setError("");
                  }}
                  style={{
                    background: "#11111C",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#CDD6F4",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    lineHeight: "1.5"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" className="btn btn-primary btn-md" onClick={handleImport}>
                  📥 Import Quiz JSON & Open Quiz Generated Page →
                </button>
              </div>
            </div>

            {/* Bottom Command Prompt Bar */}
            <form onSubmit={handleCliSubmit} className="terminal-input-bar">
              <span className="terminal-input-prompt-symbol">&gt;</span>
              <input
                className="terminal-input-field"
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder='Type a CLI command ... try "/import", "/sample", or "/clear"'
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Execute →
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
