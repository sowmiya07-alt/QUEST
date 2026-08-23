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

      // Check if questions are already in the attempt response
      let rawQuestions =
        mergedAttempt.questions ||
        mergedAttempt.review ||
        mergedAttempt.detailed_answers ||
        mergedAttempt.quiz?.questions ||
        [];

      const quizId =
        mergedAttempt.quiz_id ||
        mergedAttempt.quizId ||
        mergedAttempt.quiz?.id ||
        mergedAttempt.attempt?.quiz_id;

      // If questions are not directly in attempt record, fetch the quiz definition to get questions & correct answers
      if ((!rawQuestions || rawQuestions.length === 0) && quizId) {
        try {
          const quizRes = await studentService.getQuiz(quizId);
          const quizData = quizRes?.quiz || quizRes?.data || quizRes || {};
          const quizQuestions =
            quizRes?.questions ||
            quizData.questions ||
            quizData.questions_data ||
            [];
          if (quizQuestions && quizQuestions.length > 0) {
            mergedAttempt.questions = quizQuestions;
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
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/student/dashboard")} style={{ marginTop: "12px" }}>
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

    const parsePossibleJson = (val) => {
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
      attemptData.questions ||
      attemptData.review ||
      attemptData.detailed_answers ||
      attemptData.answers_review ||
      attemptData.data?.questions ||
      attemptData.attempt?.questions ||
      attemptData.attempt?.review ||
      attemptData.quiz?.questions ||
      attemptData.attempt?.quiz?.questions ||
      parsePossibleJson(attemptData.answers_data) ||
      parsePossibleJson(attemptData.attempt?.answers_data) ||
      [];

    rawList = parsePossibleJson(rawList) || [];
    if (rawList && typeof rawList === "object" && !Array.isArray(rawList)) {
      rawList = rawList.questions || rawList.review || Object.values(rawList);
    }

    if (!Array.isArray(rawList)) return [];

    // Extract user answers dictionary if present
    let userAnswersMap =
      parsePossibleJson(attemptData.answers) ||
      parsePossibleJson(attemptData.attempt?.answers) ||
      parsePossibleJson(attemptData.user_answers) ||
      parsePossibleJson(attemptData.attempt?.user_answers) ||
      parsePossibleJson(attemptData.answers_data) ||
      parsePossibleJson(attemptData.attempt?.answers_data) ||
      {};

    if (Array.isArray(userAnswersMap)) {
      const map = {};
      userAnswersMap.forEach((item) => {
        if (item && (item.question_id || item.id)) {
          map[item.question_id || item.id] = item.selected || item.selected_option || item.answer;
        }
      });
      userAnswersMap = map;
    }

    return rawList.map((q, idx) => {
      const qId = q.id ?? idx + 1;
      const qText = q.question_text || q.question || q.text || `Question ${idx + 1}`;

      let optA = q.option_a || (Array.isArray(q.options) ? q.options[0] : "");
      let optB = q.option_b || (Array.isArray(q.options) ? q.options[1] : "");
      let optC = q.option_c || (Array.isArray(q.options) ? q.options[2] : "");
      let optD = q.option_d || (Array.isArray(q.options) ? q.options[3] : "");
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

      // Student Answer
      let rawStudentAnswer =
        q.student_answer ||
        q.user_answer ||
        q.selected_option ||
        q.selected ||
        userAnswersMap[qId] ||
        userAnswersMap[String(qId)] ||
        userAnswersMap[idx] ||
        userAnswersMap[String(idx)];

      let studentDisplay = "Not Answered";
      if (rawStudentAnswer) {
        const key = String(rawStudentAnswer).toLowerCase().trim();
        if (optionsLookup[key]) {
          const letter = key.replace("option_", "").toUpperCase();
          studentDisplay = `Option ${letter}: ${optionsLookup[key]}`;
        } else {
          studentDisplay = String(rawStudentAnswer);
        }
      }

      // Correct Answer
      let rawCorrectAnswer =
        q.correct_answer ||
        q.correctAnswer ||
        q.answer ||
        q.correct_option ||
        "";

      let correctDisplay = "";
      if (rawCorrectAnswer) {
        const key = String(rawCorrectAnswer).toLowerCase().trim();
        if (optionsLookup[key]) {
          const letter = key.replace("option_", "").toUpperCase();
          correctDisplay = `Option ${letter}: ${optionsLookup[key]}`;
        } else if (typeof q.correctIndex === "number" && Array.isArray(q.options)) {
          correctDisplay = `Option ${String.fromCharCode(65 + q.correctIndex)}: ${q.options[q.correctIndex]}`;
        } else {
          correctDisplay = String(rawCorrectAnswer);
        }
      }

      // Is Correct
      let isCorrect = q.is_correct ?? q.correct;
      if (isCorrect === undefined && rawStudentAnswer && rawCorrectAnswer) {
        const normStudent = String(rawStudentAnswer).toLowerCase().replace("option_", "").trim();
        const normCorrect = String(rawCorrectAnswer).toLowerCase().replace("option_", "").trim();
        isCorrect = normStudent === normCorrect;
      }

      return {
        id: qId,
        question_text: qText,
        is_correct: !!isCorrect,
        student_answer: studentDisplay,
        correct_answer: correctDisplay,
        explanation: q.explanation || q.diagnostic_explanation || ""
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
      <main className="app-content container">
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

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

              return (
                <div
                  key={q.id || i}
                  className="card"
                  style={{
                    borderLeft: isCorrect ? "4px solid var(--color-success)" : "4px solid var(--color-danger)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px"
                    }}
                  >
                    <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                      {i + 1}. {qText}
                    </h3>
                    <span className={`badge ${isCorrect ? "badge-success" : "badge-danger"}`}>
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                  </div>

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
                        {correctAnswer || "See explanation below"}
                      </strong>
                    </div>
                  </div>

                  {explanation && (
                    <div
                      className="review-explanation"
                      style={{
                        background: "var(--color-elevated)",
                        padding: "12px 16px",
                        borderRadius: "8px"
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
