import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { quizService } from "../services/quizService";
import Navbar from "../components/Navbar";

export default function CreateQuiz() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [difficulty, setDifficulty] = useState("Medium"); // Easy, Medium, Tough
  const [questionsCount, setQuestionsCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(15);
  const [file, setFile] = useState(null);

  // Status & Progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    setIsProcessing(true);

    try {
      let createdQuizId = null;

      if (file) {
        // Mode 1: FormData with Reference Material File
        setLoadingStep("Creating assessment record with material...");
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("topics", topics.trim() || title.trim());
        formData.append("difficulty", difficulty);
        formData.append("question_count", questionsCount);
        formData.append("time_limit", timeLimit);
        formData.append("reference_file", file);

        const createRes = await quizService.createQuiz(formData);
        createdQuizId = createRes?.quiz_id || createRes?.id || createRes?.quiz?.id;

        if (!createdQuizId) {
          throw new Error("Quiz created, but no quiz ID was returned by server.");
        }

        // Trigger material processing
        setLoadingStep("Reading material...");
        await new Promise((r) => setTimeout(r, 600));
        setLoadingStep("Extracting content & generating quiz...");
        await quizService.generateMaterialQuiz(createdQuizId);

        setLoadingStep("Validating questions & finalizing...");
        await new Promise((r) => setTimeout(r, 400));
        navigate(`/staff/quiz/${createdQuizId}/preview`);
      } else {
        // Mode 2: JSON Assessment without material -> Navigates to AI Specification Terminal
        setLoadingStep("Creating assessment record...");
        const payload = {
          title: title.trim(),
          topics: topics.trim() || title.trim(),
          difficulty: difficulty,
          question_count: parseInt(questionsCount, 10) || 5,
          time_limit: parseInt(timeLimit, 10) || 15
        };

        const createRes = await quizService.createQuiz(payload);
        createdQuizId = createRes?.quiz_id || createRes?.id || createRes?.quiz?.id;

        if (createdQuizId) {
          navigate(`/staff/quiz/${createdQuizId}/terminal`);
        } else {
          navigate("/staff/dashboard");
        }
      }
    } catch (err) {
      console.error("[CreateQuiz] Error creating assessment:", err);
      setError(err.message || "Failed to create quiz assessment. Please try again.");
      setIsProcessing(false);
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
          disabled={isProcessing}
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
              Configure assessment parameters. Upload study material for automated inside-app generation, or continue to AI Specification mode.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {isProcessing ? (
          <div className="card" style={{ padding: "48px 36px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Processing Assessment</h3>
            <p style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              {loadingStep || "Communicating with QUEST Server..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="card" style={{ padding: "32px 36px" }}>
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Data Structures, Machine Learning, Operating Systems"
                required
                autoFocus
              />
            </div>

            {/* Topics / Focus Areas */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="label">Topics / Focus Areas</label>
              <input
                className="input"
                type="text"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g. B-Trees, Dynamic Programming, Page Replacement"
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

            {/* Reference File Upload Material */}
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="label">
                Upload Study Material <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>(Optional PDF/TXT)</span>
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
                        <div className="file-meta">{(file.size / 1024).toFixed(1)} KB • Reference file attached</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label htmlFor="material-upload" style={{ cursor: "pointer", display: "block" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                    <span style={{ fontWeight: "700", color: "var(--color-text-primary)", fontSize: "15px" }}>
                      Click to upload reference material
                    </span>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Upload PDF or TXT to automatically generate questions from document
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`badge ${file ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "11px" }}>
                  {file ? "⚡ REFERENCE MATERIAL MODE" : "🤖 AI SPECIFICATION MODE"}
                </span>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isProcessing}>
                {file ? "Generate from Material →" : "Proceed to AI Specification →"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
