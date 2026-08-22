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
  const { user } = useAuth();
  if (!user || user.role !== role) {
    return <Navigate to={role === "teacher" ? "/staff/login" : "/student/login"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/dashboard" element={<RequireRole role="student"><StudentDashboard /></RequireRole>} />
      <Route path="/student/join" element={<RequireRole role="student"><JoinQuiz /></RequireRole>} />
      <Route path="/student/attempts" element={<RequireRole role="student"><PreviousAttempts /></RequireRole>} />
      <Route path="/student/quiz/:quizId" element={<RequireRole role="student"><TakeQuiz /></RequireRole>} />
      <Route path="/student/result/:attemptId" element={<RequireRole role="student"><StudentResult /></RequireRole>} />
      <Route path="/student/result/:attemptId/review" element={<RequireRole role="student"><WrongAnswerReview /></RequireRole>} />

      <Route path="/staff/login" element={<TeacherLogin />} />
      <Route path="/staff/dashboard" element={<RequireRole role="teacher"><TeacherDashboard /></RequireRole>} />
      <Route path="/staff/quiz/create" element={<RequireRole role="teacher"><CreateQuiz /></RequireRole>} />
      <Route path="/staff/quiz/create/terminal" element={<RequireRole role="teacher"><AiSpecification /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/terminal" element={<RequireRole role="teacher"><AiSpecification /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/import" element={<RequireRole role="teacher"><ImportAiQuiz /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/preview" element={<RequireRole role="teacher"><QuizPreview /></RequireRole>} />
      <Route path="/staff/quiz/:quizId/results" element={<RequireRole role="teacher"><QuizResults /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
