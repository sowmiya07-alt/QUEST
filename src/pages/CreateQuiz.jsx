import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function CreateQuiz() {
  const { addQuiz } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [code, setCode] = useState("CS" + Math.floor(100 + Math.random() * 900));

  const [questions, setQuestions] = useState([
    {
      id: "q1",
      question: "Sample Question 1: What is JavaScript primary execution engine?",
      options: ["V8 Engine", "JVM", "CPython", "LLVM"],
      correctIndex: 0,
      explanation: "V8 is Google's open source high-performance JavaScript engine."
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${questions.length + 1}`,
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: ""
      }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuiz = {
      id: "q-" + Date.now(),
      code,
      title: title || "New Quiz",
      description: description || "Custom generated quiz",
      timeLimit: parseInt(timeLimit) || 15,
      createdDate: new Date().toISOString().split("T")[0],
      questionsCount: questions.length,
      questions
    };
    addQuiz(newQuiz);
    navigate(`/staff/quiz/${newQuiz.id}/preview`);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px" }}>Create New Assessment</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Manually add questions or use the AI terminal spec generator.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => navigate("/staff/quiz/create/terminal")}
          >
            💻 Launch AI Terminal Generator
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Assessment Metadata</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="label">Assessment Title</label>
                <input
                  className="input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Software Engineering Architecture"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Quiz Code (for students to join)</label>
                <input
                  className="input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description / Instructions</label>
              <input
                className="input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this assessment evaluates..."
              />
            </div>

            <div className="form-group" style={{ maxWidth: "200px" }}>
              <label className="label">Time Limit (Minutes)</label>
              <input
                className="input"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="1"
                max="180"
              />
            </div>
          </div>

          <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>Questions ({questions.length})</h3>

          {questions.map((q, qIndex) => (
            <div key={q.id || qIndex} className="card" style={{ marginBottom: "16px" }}>
              <div className="form-group">
                <label className="label">Question #{qIndex + 1}</label>
                <input
                  className="input"
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                  placeholder="Enter question statement..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Multiple Choice Options</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctIndex === oIndex}
                        onChange={() => handleQuestionChange(qIndex, "correctIndex", oIndex)}
                        title="Mark as correct answer"
                      />
                      <input
                        className="input"
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Answer Explanation</label>
                <input
                  className="input"
                  type="text"
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                  placeholder="Provide diagnostic feedback for wrong attempts..."
                />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
            <button type="button" className="btn btn-secondary btn-md" onClick={handleAddQuestion}>
              + Add Another Question
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Save & Preview Quiz →
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
