import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import AiSpecification from "./pages/AiSpecification";
import ImportAiQuiz from "./pages/ImportAiQuiz";
import QuizPreview from "./pages/QuizPreview";
import QuizResults from "./pages/QuizResults";
import JoinQuiz from "./pages/JoinQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import StudentResult from "./pages/StudentResult";
import WrongAnswerReview from "./pages/WrongAnswerReview";
import PreviousAttempts from "./pages/PreviousAttempts";

function RequireRole({ role, children }) {
  const { user, role: userRole, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="pulse-dot" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={role === "staff" || role === "teacher" ? "/staff/login" : "/student/login"} replace />;
  }

  const isRoleMatch =
    (role === "staff" || role === "teacher")
      ? userRole === "staff" || userRole === "teacher"
      : userRole === role;

  if (!isRoleMatch) {
    return <Navigate to={userRole === "staff" || userRole === "teacher" ? "/staff/dashboard" : "/student/dashboard"} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/student/login" replace />} />

      {/* Student Routes */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/dashboard" element={<RequireRole role="student"><StudentDashboard /></RequireRole>} />
      <Route path="/student/join" element={<RequireRole role="student"><JoinQuiz /></RequireRole>} />
      <Route path="/student/attempts" element={<RequireRole role="student"><PreviousAttempts /></RequireRole>} />
      <Route path="/student/quiz/:quizId" element={<RequireRole role="student"><TakeQuiz /></RequireRole>} />
      <Route path="/student/result/:attemptId" element={<RequireRole role="student"><StudentResult /></RequireRole>} />
      <Route path="/student/result/:attemptId/review" element={<RequireRole role="student"><WrongAnswerReview /></RequireRole>} />

      {/* Staff Routes */}
      <Route path="/staff/login" element={<TeacherLogin />} />
      <Route path="/staff/dashboard" element={<RequireRole role="staff"><TeacherDashboard /></RequireRole>} />
      <Route path="/staff/quiz/create" element={<RequireRole role="staff"><CreateQuiz /></RequireRole>} />
      <Route path="/staff/quiz/create/terminal" element={<RequireRole role="staff"><AiSpecification /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/terminal" element={<RequireRole role="staff"><AiSpecification /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/import" element={<RequireRole role="staff"><ImportAiQuiz /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/preview" element={<RequireRole role="staff"><QuizPreview /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/results" element={<RequireRole role="staff"><QuizResults /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
