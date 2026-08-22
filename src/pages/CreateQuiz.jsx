import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/terminal.css";

const PROMPT_ASCII_BANNER = `
 ██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗
██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝
██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║   
██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║   
██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║   
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝   
`;

export default function CreateQuiz() {
  const { addQuiz } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium"); // Easy, Medium, Tough
  const [questionsCount, setQuestionsCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(15);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // Terminal Branch B State
  const [showPromptStep, setShowPromptStep] = useState(false);
  const [jsonPrompt, setJsonPrompt] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cliInput, setCliInput] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result || "");
      };
      reader.readAsText(selectedFile);
    } else {
      setFile(null);
      setFileContent("");
    }
  };

  const handleGenerateClick = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (file) {
      // BRANCH A: Material uploaded -> generate quiz inside application
      setIsProcessing(true);
      setTimeout(() => {
        const generatedQuestions = generateInAppQuizQuestions(
          title,
          difficulty,
          parseInt(questionsCount) || 5,
          fileContent || file.name
        );

        const quizCode = "QUIZ" + Math.floor(1000 + Math.random() * 9000);
        const newQuiz = {
          id: "q-" + Date.now(),
          code: quizCode,
          title: title,
          description: `AI generated assessment from material (${file.name}) | Difficulty: ${difficulty}`,
          difficulty,
          timeLimit: parseInt(timeLimit) || 15,
          createdDate: new Date().toISOString().split("T")[0],
          assigned: true,
          questionsCount: generatedQuestions.length,
          questions: generatedQuestions
        };

        addQuiz(newQuiz);
        setIsProcessing(false);
        navigate(`/staff/quiz/${newQuiz.id}/preview`);
      }, 1000);
    } else {
      // BRANCH B: No material uploaded -> generate JSON prompt for external AI
      const promptText = buildJsonPrompt(title, difficulty, parseInt(questionsCount) || 5, timeLimit);
      setJsonPrompt(promptText);
      setShowPromptStep(true);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(jsonPrompt);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleImportPastedJson = (e) => {
    if (e) e.preventDefault();
    setParseError("");
    try {
      let parsed = JSON.parse(pastedJson);
      if (Array.isArray(parsed)) {
        parsed = { questions: parsed };
      }

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("JSON must contain a 'questions' array with valid items.");
      }

      const formattedQuestions = parsed.questions.map((q, idx) => ({
        id: q.id || `q-${idx + 1}`,
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        explanation: q.explanation || "No explanation provided."
      }));

      const quizCode = parsed.code || "QUIZ" + Math.floor(1000 + Math.random() * 9000);
      const newQuiz = {
        id: "q-imp-" + Date.now(),
        code: quizCode,
        title: parsed.title || title || "AI Generated Quiz",
        description: parsed.description || `Generated via external AI | Difficulty: ${difficulty}`,
        difficulty: parsed.difficulty || difficulty,
        timeLimit: parsed.timeLimit || parseInt(timeLimit) || 15,
        createdDate: new Date().toISOString().split("T")[0],
        assigned: true,
        questionsCount: formattedQuestions.length,
        questions: formattedQuestions
      };

      addQuiz(newQuiz);
      navigate(`/staff/quiz/${newQuiz.id}/preview`);
    } catch (err) {
      setParseError("Invalid JSON structure: " + err.message);
    }
  };

  const handleTerminalCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    setCliInput("");

    if (cmd === "/copy") {
      handleCopyPrompt();
    } else if (cmd === "/import" || cmd === "/create") {
      handleImportPastedJson();
    } else if (cmd === "/clear") {
      setPastedJson("");
      setParseError("");
    } else if (cmd === "/back") {
      setShowPromptStep(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: showPromptStep ? "940px" : "800px" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/staff/dashboard")}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Staff Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="badge badge-accent">Faculty Generator</span>
              <span className="badge badge-neutral">Step 1 of 2</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Generate Quiz Assessment</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Configure assessment parameters. Upload study material for automatic inside-app generation, or generate a JSON prompt for external AI.
            </p>
          </div>
          <div>
            <Link to="/staff/quiz/create/terminal" className="btn btn-secondary btn-sm">
              💻 AI Spec Terminal
            </Link>
          </div>
        </div>

        {!showPromptStep ? (
          /* FORM CONFIGURATION VIEW */
          <form onSubmit={handleGenerateClick} className="card" style={{ padding: "32px 36px" }}>
            <h3 style={{ fontSize: "19px", fontWeight: "700", marginBottom: "22px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              Assessment Configuration
            </h3>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="label">Assessment Title *</label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures, Machine Learning, World History"
                required
              />
            </div>

            {/* Difficulty Pills */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="label">Difficulty Level *</label>
              <div className="difficulty-pill-group">
                {[
                  { id: "Easy", icon: "🟢", label: "Easy", class: "easy" },
                  { id: "Medium", icon: "🟡", label: "Medium", class: "medium" },
                  { id: "Tough", icon: "🔴", label: "Tough", class: "tough" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`difficulty-pill ${difficulty === item.id ? `active ${item.class}` : ""}`}
                    onClick={() => setDifficulty(item.id)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for Questions Count & Time Limit */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div className="form-group">
                <label className="label">Number of Questions *</label>
                <input
                  className="input"
                  type="number"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(e.target.value)}
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Time Limit (Minutes)</label>
                <input
                  className="input"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="1"
                  max="180"
                  required
                />
              </div>
            </div>

            {/* Optional File Upload Material */}
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="label">
                Upload Study Material <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>(Optional)</span>
              </label>
              <div className="upload-dropzone">
                <input
                  type="file"
                  id="material-upload"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.doc,.docx,.md,.json"
                  style={{ display: "none" }}
                />
                {file ? (
                  <div className="uploaded-file-pill">
                    <div className="uploaded-file-info">
                      <span className="file-icon">📄</span>
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">{(file.size / 1024).toFixed(1)} KB • Material ready for generation</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileContent("");
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label htmlFor="material-upload" style={{ cursor: "pointer", display: "block" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                    <span style={{ fontWeight: "700", color: "var(--color-text-primary)", fontSize: "15px" }}>
                      Click to upload file
                    </span>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Upload PDF, TXT, DOC, or Markdown material (Optional)
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`badge ${file ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "11px" }}>
                  {file ? "⚡ IN-APP GENERATION MODE" : "🤖 EXTERNAL AI PROMPT MODE"}
                </span>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isProcessing}>
                {isProcessing ? "Generating Quiz..." : "Generate Quiz Assessment →"}
              </button>
            </div>
          </form>
        ) : (
          /* BRANCH B: RETRO TERMINAL DESIGN MATCHING REFERENCE IMAGES */
          <div className="terminal-page-container">
            <div className="terminal-window">
              {/* macOS Window Title Bar */}
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot dot-red" />
                  <span className="terminal-dot dot-yellow" />
                  <span className="terminal-dot dot-green" />
                </div>
                <span className="terminal-title">teacher@quest ~ /json-prompt-generator</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowPromptStep(false)}
                  style={{ fontSize: "11px", padding: "2px 8px" }}
                >
                  ← Form Specs
                </button>
              </div>

              {/* Terminal Body */}
              <div className="terminal-body">
                {/* ASCII Banner Header */}
                <div className="terminal-ascii-banner" style={{ color: "#F5C2E7" }}>
                  {PROMPT_ASCII_BANNER}
                </div>

                {/* System initialization status */}
                <div className="terminal-line">
                  <span className="terminal-system">Initializing QUEST AI prompt generator engine...</span>
                </div>
                <div className="terminal-line">
                  <span className="terminal-progress-track">[██████████████████████████████] done</span>
                </div>
                <div className="terminal-line">
                  <span className="terminal-ready">
                    ✦ Target Topic: "{title}" | Difficulty: {difficulty} | Questions: {questionsCount} | Time: {timeLimit} mins
                  </span>
                </div>

                {/* Grid layout inside terminal matching reference image 2 */}
                <div className="terminal-grid">
                  {/* Left Column: Generated Prompt Card */}
                  <div className="terminal-grid-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span className="terminal-grid-title" style={{ margin: 0 }}>Step 1: Generated Prompt</span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleCopyPrompt}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        {copiedToast ? "✓ Copied!" : "📋 Copy Prompt"}
                      </button>
                    </div>
                    <textarea
                      className="json-input"
                      rows={7}
                      value={jsonPrompt}
                      readOnly
                      style={{
                        background: "#11111C",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#FAB387",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        lineHeight: "1.4"
                      }}
                    />
                  </div>

                  {/* Right Column: Workflow Steps & Instructions */}
                  <div className="terminal-grid-card">
                    <div className="terminal-grid-title">External AI Workflow</div>
                    <div className="terminal-row">
                      <span className="terminal-label">Step 1:</span>
                      <span className="terminal-val">Click 'Copy Prompt' button</span>
                    </div>
                    <div className="terminal-row">
                      <span className="terminal-label">Step 2:</span>
                      <span className="terminal-val">Paste into ChatGPT / Claude</span>
                    </div>
                    <div className="terminal-row">
                      <span className="terminal-label">Step 3:</span>
                      <span className="terminal-val">Paste AI response JSON below</span>
                    </div>
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed rgba(255, 255, 255, 0.1)", fontSize: "11px", color: "#A6ADC8" }}>
                      💡 Tip: Use <span className="terminal-cmd-highlight" onClick={handleCopyPrompt}>/copy</span> to copy prompt, or <span className="terminal-cmd-highlight" onClick={() => handleImportPastedJson()}>/import</span> to submit.
                    </div>
                  </div>
                </div>

                {/* Step 2 & 3: Paste AI JSON Output inside Terminal */}
                <form onSubmit={handleImportPastedJson} style={{ marginTop: "8px" }}>
                  {parseError && (
                    <div className="terminal-line" style={{ marginBottom: "8px" }}>
                      <span className="terminal-error">✖ {parseError}</span>
                    </div>
                  )}

                  <label className="terminal-label" style={{ display: "block", marginBottom: "6px" }}>
                    Step 2 & 3: Paste External AI Output JSON Response Here *
                  </label>
                  <textarea
                    className="json-input"
                    rows={8}
                    value={pastedJson}
                    onChange={(e) => {
                      setPastedJson(e.target.value);
                      setParseError("");
                    }}
                    placeholder='Paste external AI output JSON string here e.g. {"title": "...", "questions": [...] }'
                    required
                    style={{
                      background: "#11111C",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "10px",
                      color: "#A6E3A1",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      lineHeight: "1.5"
                    }}
                  />

                  <div style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopyPrompt()}
                    >
                      Re-copy Prompt
                    </button>
                    <button type="submit" className="btn btn-primary btn-md">
                      📥 Import & Open Quiz Generated Page →
                    </button>
                  </div>
                </form>
              </div>

              {/* Command Input Prompt at Bottom */}
              <form onSubmit={handleTerminalCliSubmit} className="terminal-input-bar">
                <span className="terminal-input-prompt-symbol">&gt;</span>
                <input
                  className="terminal-input-field"
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder='Type a command ... try "/copy", "/import", or "/clear"'
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Execute →
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Helper to build formatted AI prompt for external models
 */
function buildJsonPrompt(title, difficulty, count, timeLimit) {
  return `Generate a multiple choice quiz JSON on topic "${title}".
Difficulty Level: ${difficulty}
Number of Questions: ${count}
Time Limit: ${timeLimit} minutes

Output ONLY a valid JSON object matching this exact schema:
{
  "title": "${title}",
  "difficulty": "${difficulty}",
  "timeLimit": ${timeLimit},
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Diagnostic explanation for correct choice..."
    }
  ]
}`;
}

/**
 * Helper to generate questions in-app if material file is uploaded
 */
function generateInAppQuizQuestions(title, difficulty, count, materialText) {
  const sampleTopics = [
    `Core Principles of ${title}`,
    `Advanced Optimization in ${title}`,
    `Failure Modes and Edge Cases in ${title}`,
    `Architectural Best Practices for ${title}`,
    `Performance Benchmarks and Diagnostics`
  ];

  const questions = [];
  for (let i = 0; i < count; i++) {
    const topic = sampleTopics[i % sampleTopics.length];
    questions.push({
      id: `q-mat-${i + 1}`,
      question: `[${difficulty}] In reference to material context on "${title}": What is the fundamental concept behind ${topic}?`,
      options: [
        `Optimal execution pattern using ${topic} abstraction`,
        `Legacy fallback strategy without state persistence`,
        `Synchronous blocking queue overhead`,
        `Unrestricted memory buffer allocation`
      ],
      correctIndex: 0,
      explanation: `Extracted from uploaded material: Using ${topic} guarantees proper isolation and performance standards.`
    });
  }
  return questions;
}
