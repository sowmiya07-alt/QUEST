import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const QUOTES_TEACHER = [
  { text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
  { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  { text: "Transforming curriculum into intelligent evaluation rubrics.", author: "QUEST Engine" }
];

const QUOTES_STUDENT = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Real-time diagnostic analysis and instant score breakdown.", author: "QUEST Engine" }
];

export default function AnimatedAuth({ initialMode = "login", initialRole = "teacher" }) {
  const { loginOrRegisterUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "login" | "register"
  const [mode, setMode] = useState(() => {
    if (location.pathname.includes("register")) return "register";
    return initialMode;
  });

  // Role: "teacher" | "student"
  const [role, setRole] = useState(() => {
    if (location.pathname.includes("student")) return "student";
    return initialRole;
  });

  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = role === "teacher";
  const isRegister = mode === "register" && !isTeacher;

  const quotesList = isTeacher ? QUOTES_TEACHER : QUOTES_STUDENT;
  const currentQuote = quotesList[activeQuoteIndex % quotesList.length];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessToast("");

    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!identity.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginOrRegisterUser({
        name: name.trim() || identity.trim(),
        identity: identity.trim(),
        password: password.trim(),
        role,
        isRegister
      });

      const authenticatedName = res?.user?.name || name.trim() || identity.trim();
      setSuccessToast(`Authenticated as ${authenticatedName}. Redirecting to ${isTeacher ? "Faculty Console" : "Student Portal"}...`);

      setTimeout(() => {
        setIsLoading(false);
        navigate(isTeacher ? "/staff/dashboard" : "/student/dashboard");
      }, 500);
    } catch (err) {
      console.error("[AnimatedAuth] Auth error:", err);
      setIsLoading(false);
      setError(err.message || "Authentication error.");
    }
  };

  return (
    <div className={`split-auth-shell ${isTeacher ? "theme-teacher" : "theme-student"}`}>
      {/* LEFT HALF: ANIMATIVE GRAPHIC & INTERACTIVE QUOTE PANEL */}
      <div className="auth-left-panel">
        <div className="auth-left-auras">
          <div className="aura-orb aura-1" />
          <div className="aura-orb aura-2" />
        </div>

        <div className="auth-left-content">
          <Link to="/" className="auth-split-logo">
            <span className="logo-symbol">❖</span>
            <span>QUEST</span>
          </Link>

          {/* Interactive Dynamic Quote Box */}
          <div className="auth-quote-container">
            <div className="quote-mark">“</div>
            <p className="quote-text">{currentQuote.text}</p>
            <span className="quote-author">— {currentQuote.author}</span>

            {/* Interactive Quote Switcher Dots */}
            <div className="quote-dots-bar">
              {quotesList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`quote-dot ${idx === (activeQuoteIndex % quotesList.length) ? "active" : ""}`}
                  onClick={() => setActiveQuoteIndex(idx)}
                  title={`View quote ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Feature Tags */}
          <div className="auth-floating-tags">
            <div className="floating-tag tag-1">
              <div>
                <strong>AI Specification Engine</strong>
                <p style={{ fontSize: "11.5px", color: "var(--color-text-muted)", margin: 0 }}>Automated prompt synthesis & rubrics</p>
              </div>
            </div>
            <div className="floating-tag tag-2">
              <div>
                <strong>Diagnostic Score Cards</strong>
                <p style={{ fontSize: "11.5px", color: "var(--color-text-muted)", margin: 0 }}>Instant answer review & explanations</p>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <span>© 2026 QUEST Assessment Engine. High-Performance Evaluation Platform.</span>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: CLEAN & ELEGANT FORM PANEL */}
      <div className="auth-right-panel">
        <div className="auth-right-content">

          {/* Clean Role Toggle Switcher Pill */}
          <div className="clean-role-switcher">
            <div className={`clean-role-pill ${isTeacher ? "pos-left" : "pos-right"}`} />
            <button
              type="button"
              className={`clean-role-btn ${isTeacher ? "active" : ""}`}
              onClick={() => {
                setRole("teacher");
                setMode("login");
                setError("");
                setActiveQuoteIndex(0);
              }}
            >
              Faculty Portal
            </button>
            <button
              type="button"
              className={`clean-role-btn ${!isTeacher ? "active" : ""}`}
              onClick={() => {
                setRole("student");
                setError("");
                setActiveQuoteIndex(0);
              }}
            >
              Student Portal
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header-box">
            <h2 className="form-title">
              {isRegister
                ? "Create Student Account"
                : `Sign In to ${isTeacher ? "Faculty Console" : "Student Portal"}`}
            </h2>
            <p className="form-subtitle">
              {isRegister
                ? "Enter your details to configure your student profile."
                : "Welcome back. Enter your account credentials to access your dashboard."}
            </p>
          </div>

          {/* Toast / Error */}
          {error && <div className="form-error">{error}</div>}
          {successToast && (
            <div className="badge badge-success" style={{ padding: "12px", width: "100%", marginBottom: "16px", textTransform: "none", fontSize: "13px" }}>
              {successToast}
            </div>
          )}

          {/* Clean Form */}
          <form onSubmit={handleSubmit} className="auth-form-fields">
            {/* Full Name field (Only in Student Register mode) */}
            {isRegister && (
              <div className="form-group">
                <label className="label">Student Full Name *</label>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required={isRegister}
                  autoFocus
                />
              </div>
            )}

            {/* Identity / Email / Student Code */}
            <div className="form-group">
              <label className="label">
                {isTeacher
                  ? "Faculty User Code or Email *"
                  : isRegister
                  ? "Email Address *"
                  : "Student Code or Email *"}
              </label>
              <input
                className="input"
                type={isRegister ? "email" : "text"}
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder={isTeacher ? "Enter faculty code (e.g. staff)" : isRegister ? "Enter email address" : "Enter student code (e.g. STU-1234)"}
                required
              />
            </div>

            {/* Password with Text Reveal Toggle */}
            <div className="form-group">
              <label className="label">Password *</label>
              <div className="animated-input-wrapper">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)" }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Clean Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                "Authenticating..."
              ) : isRegister ? (
                "Create Student Account →"
              ) : (
                `Sign In as ${isTeacher ? "Faculty" : "Student"} →`
              )}
            </button>
          </form>

          {/* Clean Bottom Mode Toggle Link */}
          <div className="form-footer-toggle">
            {isTeacher ? (
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Faculty accounts are managed by the administrator.
              </span>
            ) : isRegister ? (
              <span>
                Already registered?{" "}
                <button type="button" className="text-link-btn" onClick={() => setMode("login")}>
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => {
                    setRole("student");
                    setMode("register");
                  }}
                >
                  Create an account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
