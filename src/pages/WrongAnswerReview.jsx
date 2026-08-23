import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import studentService from "../services/studentService";
import Navbar from "../components/Navbar";

export default function WrongAnswerReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReview = useCallback(async () => {
    if (!attemptId) return;
    try {
      setLoading(true);
      setError("");
      const res = await studentService.getAttempt(attemptId);
      const attemptObj = res?.attempt || res?.data?.attempt || res?.data || res || {};

      let mergedAttempt = {
        ...(typeof res === "object" ? res : {}),
        ...(typeof attemptObj === "object" ? attemptObj : {})
      };

      // Parse answers_data or review if they are JSON strings
      const parseJsonSafe = (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return null;
          }
        }
        return val;
      };

      const parsedAnswersData =
        parseJsonSafe(mergedAttempt.answers_data) ||
        parseJsonSafe(mergedAttempt.attempt?.answers_data) ||
        parseJsonSafe(mergedAttempt.detailed_answers) ||
        parseJsonSafe(mergedAttempt.review) ||
        null;

      if (parsedAnswersData) {
        mergedAttempt.parsed_answers_data = parsedAnswersData;
      }

      const quizId =
        mergedAttempt.quiz_id ||
        mergedAttempt.quizId ||
        mergedAttempt.quiz?.id ||
        mergedAttempt.attempt?.quiz_id;

      // Fetch supplementary quiz structure if quizId is available
      if (quizId) {
        try {
          const quizRes = await studentService.getQuiz(quizId);
          const quizData = quizRes?.quiz || quizRes?.data || quizRes || {};
          const quizQuestions =
            quizRes?.questions ||
            quizData.questions ||
            quizData.questions_data ||
            [];
          if (quizQuestions && quizQuestions.length > 0) {
            mergedAttempt.quiz_questions = quizQuestions;
            if (!mergedAttempt.quiz_title) {
              mergedAttempt.quiz_title = quizData.title || quizRes.title;
            }
          }
        } catch (qErr) {
          console.warn("[WrongAnswerReview] Supplementary quiz questions fetch:", qErr);
        }
      }

      setAttempt(mergedAttempt);
    } catch (err) {
      console.error("[WrongAnswerReview] Error loading review:", err);
      setError(err.message || "Failed to load diagnostic review.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
              Loading diagnostic answer breakdown...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="app-content container">
          <div className="card empty-state">
            <p>{error || "Attempt review not found."}</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/student/dashboard")}
              style={{ marginTop: "12px" }}
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Parse and normalize questions list from all potential Django formats
  const extractQuestionsForReview = (attemptData) => {
    if (!attemptData) return [];

    const parseJson = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    };

    let rawList =
      attemptData.parsed_answers_data ||
      attemptData.questions ||
      attemptData.review ||
      attemptData.detailed_answers ||
      attemptData.answers_review ||
      attemptData.quiz_questions ||
      attemptData.quiz?.questions ||
      attemptData.data?.questions ||
      [];

    rawList = parseJson(rawList) || [];
    if (rawList && typeof rawList === "object" && !Array.isArray(rawList)) {
      rawList = rawList.questions || rawList.review || Object.values(rawList);
    }

    if (!Array.isArray(rawList) || rawList.length === 0) {
      if (Array.isArray(attemptData.quiz_questions)) {
        rawList = attemptData.quiz_questions;
      }
    }

    if (!Array.isArray(rawList)) return [];

    // Extract user answers dictionary
    let userAnswersMap =
      parseJson(attemptData.answers) ||
      parseJson(attemptData.attempt?.answers) ||
      parseJson(attemptData.user_answers) ||
      parseJson(attemptData.attempt?.user_answers) ||
      parseJson(attemptData.answers_data) ||
      parseJson(attemptData.attempt?.answers_data) ||
      attemptData.parsed_answers_data ||
      {};

    if (Array.isArray(userAnswersMap)) {
      const map = {};
      userAnswersMap.forEach((item, i) => {
        if (item && typeof item === "object") {
          const key = item.question_id || item.id || item.questionId || i + 1;
          map[key] = item.student_answer || item.user_answer || item.selected || item.selected_option || item.answer;
        }
      });
      userAnswersMap = map;
    }

    const quizQuestionsList = Array.isArray(attemptData.quiz_questions) ? attemptData.quiz_questions : [];

    return rawList.map((q, idx) => {
      const qId = q.id ?? q.question_id ?? idx + 1;
      const quizQ = quizQuestionsList.find((item, i) => (item.id === qId || i === idx)) || {};

      const merged = {
        ...quizQ,
        ...q
      };

      const qText = merged.question_text || merged.question || merged.text || `Question ${idx + 1}`;

      // Extract options
      let optA = merged.option_a || (Array.isArray(merged.options) ? merged.options[0] : "");
      let optB = merged.option_b || (Array.isArray(merged.options) ? merged.options[1] : "");
      let optC = merged.option_c || (Array.isArray(merged.options) ? merged.options[2] : "");
      let optD = merged.option_d || (Array.isArray(merged.options) ? merged.options[3] : "");
      if (typeof optA === "object" && optA) optA = optA.text || optA.label || "";
      if (typeof optB === "object" && optB) optB = optB.text || optB.label || "";
      if (typeof optC === "object" && optC) optC = optC.text || optC.label || "";
      if (typeof optD === "object" && optD) optD = optD.text || optD.label || "";

      const optionsLookup = {
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        a: optA,
        b: optB,
        c: optC,
        d: optD
      };

      const allOptionsList = [
        { key: "option_a", letter: "A", text: optA },
        { key: "option_b", letter: "B", text: optB },
        { key: "option_c", letter: "C", text: optC },
        { key: "option_d", letter: "D", text: optD }
      ].filter((o) => !!o.text);

      // Student Answer
      let rawStudentAnswer =
        merged.student_answer ||
        merged.user_answer ||
        merged.selected_option ||
        merged.selected ||
        userAnswersMap[qId] ||
        userAnswersMap[String(qId)] ||
        userAnswersMap[idx] ||
        userAnswersMap[String(idx)];

      let studentKey = "";
      let studentDisplay = "Not Answered";

      if (rawStudentAnswer) {
        const rawLower = String(rawStudentAnswer).toLowerCase().trim();
        studentKey = rawLower;
        if (optionsLookup[rawLower]) {
          const letter = rawLower.replace("option_", "").toUpperCase();
          studentDisplay = `Option ${letter}: ${optionsLookup[rawLower]}`;
        } else {
          // Check if raw matches an option text directly
          const matched = allOptionsList.find((o) => o.text.toLowerCase() === rawLower);
          if (matched) {
            studentKey = matched.key;
            studentDisplay = `Option ${matched.letter}: ${matched.text}`;
          } else {
            studentDisplay = String(rawStudentAnswer);
          }
        }
      }

      // Correct Answer
      let rawCorrectAnswer =
        merged.correct_answer ||
        merged.correctAnswer ||
        merged.correct_option ||
        merged.answer ||
        merged.correct ||
        merged.solution ||
        "";

      let correctKey = "";
      let correctDisplay = "";

      if (rawCorrectAnswer) {
        const rawLower = String(rawCorrectAnswer).toLowerCase().trim();
        correctKey = rawLower;
        if (optionsLookup[rawLower]) {
          const letter = rawLower.replace("option_", "").toUpperCase();
          correctDisplay = `Option ${letter}: ${optionsLookup[rawLower]}`;
        } else if (typeof merged.correctIndex === "number" && Array.isArray(merged.options)) {
          const letter = String.fromCharCode(65 + merged.correctIndex);
          correctKey = `option_${String.fromCharCode(97 + merged.correctIndex)}`;
          correctDisplay = `Option ${letter}: ${merged.options[merged.correctIndex]}`;
        } else {
          const matched = allOptionsList.find((o) => o.text.toLowerCase() === rawLower);
          if (matched) {
            correctKey = matched.key;
            correctDisplay = `Option ${matched.letter}: ${matched.text}`;
          } else {
            correctDisplay = String(rawCorrectAnswer);
          }
        }
      }

      // Is Correct
      let isCorrect = merged.is_correct ?? merged.correct;
      if (isCorrect === undefined) {
        if (studentKey && correctKey) {
          const normStudent = studentKey.replace("option_", "").trim();
          const normCorrect = correctKey.replace("option_", "").trim();
          isCorrect = normStudent === normCorrect;
        } else {
          isCorrect = false;
        }
      }

      return {
        id: qId,
        question_text: qText,
        options: allOptionsList,
        student_key: studentKey,
        correct_key: correctKey,
        is_correct: !!isCorrect,
        student_answer: studentDisplay,
        correct_answer: correctDisplay,
        explanation: merged.explanation || merged.diagnostic_explanation || ""
      };
    });
  };

  const quizTitle = attempt.quiz_title || attempt.quizTitle || attempt.quiz?.title || "Quiz Assessment";
  const score = attempt.score ?? attempt.percentage ?? 0;
  const total = attempt.total_questions ?? attempt.total ?? 0;
  const correctCount = attempt.correct_count ?? attempt.correctCount ?? 0;
  const questions = extractQuestionsForReview(attempt);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container" style={{ maxWidth: "900px" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/student/dashboard")}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px" }}>Diagnostic Answer Review</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {quizTitle} | Score: {score}% {total > 0 ? `(${correctCount}/${total} Correct)` : ""}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {questions.length === 0 ? (
            <div className="card empty-state">
              <p>Detailed question breakdown is currently being processed by the server.</p>
            </div>
          ) : (
            questions.map((q, i) => {
              const qText = q.question_text || `Question ${i + 1}`;
              const isCorrect = q.is_correct;
              const studentAnswer = q.student_answer;
              const correctAnswer = q.correct_answer;
              const explanation = q.explanation;
              const options = q.options || [];

              return (
                <div
                  key={q.id || i}
                  className="card"
                  style={{
                    borderLeft: isCorrect ? "4px solid var(--color-success)" : "4px solid var(--color-danger)",
                    padding: "24px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "16px"
                    }}
                  >
                    <h3 style={{ fontSize: "16px", fontWeight: "700", lineHeight: "1.4" }}>
                      {i + 1}. {qText}
                    </h3>
                    <span className={`badge ${isCorrect ? "badge-success" : "badge-danger"}`} style={{ flexShrink: 0 }}>
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                  </div>

                  {/* Multiple Choice Options List with visual highlight */}
                  {options.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                      {options.map((opt) => {
                        const isStudentChoice =
                          q.student_key &&
                          (q.student_key === opt.key || q.student_key === opt.letter.toLowerCase());
                        const isCorrectChoice =
                          q.correct_key &&
                          (q.correct_key === opt.key || q.correct_key === opt.letter.toLowerCase());

                        let borderColor = "var(--color-border)";
                        let bgColor = "var(--color-elevated)";
                        let badgeTag = null;

                        if (isCorrectChoice) {
                          borderColor = "var(--color-success)";
                          bgColor = "rgba(16, 185, 129, 0.12)";
                          badgeTag = <span style={{ color: "var(--color-success)", fontWeight: "700", fontSize: "12px" }}>✓ Correct Answer</span>;
                        } else if (isStudentChoice && !isCorrect) {
                          borderColor = "var(--color-danger)";
                          bgColor = "rgba(239, 68, 68, 0.12)";
                          badgeTag = <span style={{ color: "var(--color-danger)", fontWeight: "700", fontSize: "12px" }}>✗ Your Choice</span>;
                        }

                        return (
                          <div
                            key={opt.key}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: "6px",
                              border: `1px solid ${borderColor}`,
                              background: bgColor,
                              fontSize: "13.5px"
                            }}
                          >
                            <div>
                              <strong style={{ marginRight: "8px" }}>{opt.letter}.</strong>
                              <span>{opt.text}</span>
                            </div>
                            {badgeTag}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary Comparison Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "14px"
                    }}
                  >
                    <div
                      style={{
                        background: isCorrect ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: isCorrect ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(239, 68, 68, 0.25)"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "var(--color-text-muted)",
                          display: "block",
                          marginBottom: "4px"
                        }}
                      >
                        Your Answer
                      </span>
                      <strong style={{ color: isCorrect ? "var(--color-success)" : "var(--color-danger)", fontSize: "14px" }}>
                        {studentAnswer}
                      </strong>
                    </div>

                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "var(--color-text-muted)",
                          display: "block",
                          marginBottom: "4px"
                        }}
                      >
                        Correct Answer
                      </span>
                      <strong style={{ color: "var(--color-success)", fontSize: "14px" }}>
                        {correctAnswer || "Refer to explanation below"}
                      </strong>
                    </div>
                  </div>

                  {explanation && (
                    <div
                      className="review-explanation"
                      style={{
                        background: "var(--color-elevated)",
                        padding: "14px 18px",
                        borderRadius: "8px",
                        borderLeft: "3px solid var(--color-accent)"
                      }}
                    >
                      <strong style={{ color: "var(--color-accent)", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                        💡 Diagnostic Explanation:
                      </strong>
                      <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5", color: "var(--color-text-secondary)" }}>
                        {explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
