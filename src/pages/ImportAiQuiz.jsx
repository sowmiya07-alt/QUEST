import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ImportAiQuiz() {
  const { addQuiz } = useAuth();
  const navigate = useNavigate();
  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      {
        code: "IMPORTED1",
        title: "Database Indexing & Query Optimization",
        description: "Covers B-Trees, Hash Indexes, and Execution Plans",
        timeLimit: 10,
        questions: [
          {
            id: "imp-1",
            question: "Which index type is best suited for range queries?",
            options: ["Hash Index", "B-Tree Index", "Bitmap Index", "Full-Text Index"],
            correctIndex: 1,
            explanation: "B-Trees keep keys in sorted order, enabling logarithmic range searches."
          }
        ]
      },
      null,
      2
    )
  );
  const [error, setError] = useState("");

  const handleImport = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.title || !parsed.questions) {
        throw new Error("JSON must contain title and questions array.");
      }
      const newQuiz = {
        id: "q-imp-" + Date.now(),
        code: parsed.code || "IMP" + Math.floor(1000 + Math.random() * 9000),
        title: parsed.title,
        description: parsed.description || "Imported JSON Quiz",
        timeLimit: parsed.timeLimit || 15,
        createdDate: new Date().toISOString().split("T")[0],
        questionsCount: parsed.questions.length,
        questions: parsed.questions
      };
      addQuiz(newQuiz);
      navigate(`/staff/quiz/${newQuiz.id}/preview`);
    } catch (err) {
      setError(err.message || "Invalid JSON formatting.");
    }
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
          <h1 style={{ fontSize: "28px" }}>Import Assessment Specification</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Paste raw JSON schema to populate quiz questions immediately.
          </p>
        </div>

        <div className="card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleImport}>
            <div className="form-group">
              <label className="label">JSON Specification Payload</label>
              <textarea
                className="json-input"
                rows={16}
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError("");
                }}
                style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md" style={{ marginTop: "12px" }}>
              Import Quiz JSON & Preview →
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
