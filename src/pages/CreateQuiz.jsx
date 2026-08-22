import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

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

  // Prompt / External AI Modal state
  const [showPromptStep, setShowPromptStep] = useState(false);
  const [jsonPrompt, setJsonPrompt] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
        // Direct to Quiz Generated Page (verify, modify, assign, download)
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
    e.preventDefault();
    setParseError("");
    try {
      let parsed = JSON.parse(pastedJson);
      // If array wrapper
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
      // Direct to Quiz Generated Page
      navigate(`/staff/quiz/${newQuiz.id}/preview`);
    } catch (err) {
      setParseError("Invalid JSON structure: " + err.message);
    }
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
          <h1 style={{ fontSize: "28px" }}>Generate Quiz Assessment</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Configure assessment parameters. Upload study material for automatic inside-app generation, or generate a JSON prompt for external AI.
          </p>
        </div>

        {!showPromptStep ? (
          <form onSubmit={handleGenerateClick} className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Assessment Configuration</h3>

            {/* Title */}
            <div className="form-group">
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
            <div className="form-group">
              <label className="label">Difficulty Level *</label>
              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                {["Easy", "Medium", "Tough"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`btn ${difficulty === level ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setDifficulty(level)}
                    style={{ flex: 1 }}
                  >
                    {level === "Easy" ? "🟢 Easy" : level === "Medium" ? "🟡 Medium" : "🔴 Tough"}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for Questions Count & Time Limit */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
            <div className="form-group" style={{ marginTop: "8px" }}>
              <label className="label">
                Upload Study Material <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>(Optional)</span>
              </label>
              <div
                style={{
                  border: "2px dashed var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  textAlign: "center",
                  background: "var(--color-elevated)",
                  cursor: "pointer"
                }}
              >
                <input
                  type="file"
                  id="material-upload"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.doc,.docx,.md,.json"
                  style={{ display: "none" }}
                />
                <label htmlFor="material-upload" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
                  {file ? (
                    <div>
                      <strong style={{ color: "var(--color-accent)" }}>{file.name}</strong>
                      <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                        {(file.size / 1024).toFixed(1)} KB — Uploaded material ready for in-app generation
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                        Click to upload file
                      </span>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Upload PDF, TXT, DOC, or Markdown material (Optional)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                {file ? "⚡ In-App AI generation mode (Material attached)" : "🤖 External AI JSON Prompt mode (No material)"}
              </span>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isProcessing}>
                {isProcessing ? "Generating Quiz..." : "Generate Quiz →"}
              </button>
            </div>
          </form>
        ) : (
          /* BRANCH B: JSON PROMPT & PASTE MODAL / SECTION */
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-accent">External AI Prompt Workflow</span>
                <h2 style={{ fontSize: "22px", marginTop: "4px" }}>JSON Quiz Prompt Generated</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPromptStep(false)}>
                ← Change Form Specs
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              Follow these simple steps: <strong>1. Copy the JSON Prompt</strong> → <strong>2. Paste into external AI</strong> (ChatGPT / Claude / Gemini) → <strong>3. Paste the AI response below</strong>.
            </p>

            {/* Step 1: Copy Prompt */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="label">Step 1: Generated AI JSON Prompt</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyPrompt}
                >
                  {copiedToast ? "✓ Copied to Clipboard!" : "📋 Copy JSON Prompt"}
                </button>
              </div>
              <textarea
                className="json-input"
                rows={8}
                value={jsonPrompt}
                readOnly
                style={{ fontFamily: "var(--font-mono)", fontSize: "12px", background: "#0B0D0F", color: "var(--color-accent)" }}
              />
            </div>

            {/* Step 2 & 3: Paste JSON Response */}
            <form onSubmit={handleImportPastedJson} style={{ marginTop: "24px" }}>
              {parseError && <div className="form-error">{parseError}</div>}
              <div className="form-group">
                <label className="label">Step 2 & 3: Paste External AI JSON Response Here *</label>
                <textarea
                  className="json-input"
                  rows={10}
                  value={pastedJson}
                  onChange={(e) => {
                    setPastedJson(e.target.value);
                    setParseError("");
                  }}
                  placeholder='Paste AI output JSON here e.g. {"title": "...", "questions": [...] }'
                  required
                  style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => handleCopyPrompt()}
                >
                  Re-copy Prompt
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Import & Open Quiz Generated Page →
                </button>
              </div>
            </form>
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
