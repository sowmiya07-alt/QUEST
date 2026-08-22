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
  const { loginAsStaff, loginAsStudent, registerStudent } = useAuth();
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
  const [registeredCode, setRegisteredCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = role === "teacher";
  const isRegister = mode === "register";

  const quotesList = isTeacher ? QUOTES_TEACHER : QUOTES_STUDENT;
  const currentQuote = quotesList[activeQuoteIndex % quotesList.length];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessToast("");
    setRegisteredCode("");

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
      if (isRegister) {
        if (!isTeacher) {
          const res = await registerStudent({
            name: name.trim(),
            email: identity.trim(),
            password: password.trim()
          });
          const userCode = res?.user?.user_code || res?.user_code || res?.code;
          if (userCode) {
            setRegisteredCode(userCode);
            setSuccessToast(`Account created! Your Student ID is ${userCode}.`);
          } else {
            setSuccessToast("Account created successfully. You can now sign in.");
          }
        } else {
          throw new Error("Staff accounts must be registered by system administrator.");
        }
      } else {
        if (isTeacher) {
          const res = await loginAsStaff({
            user_code: identity.trim(),
            password: password.trim()
          });
          const facultyName = res?.user?.name || "Faculty Member";
          setSuccessToast(`Welcome back, ${facultyName}. Redirecting to Faculty Console...`);
          setTimeout(() => {
            navigate("/staff/dashboard");
          }, 800);
        } else {
          const res = await loginAsStudent({
            user_code: identity.trim(),
            password: password.trim()
          });
          const studentName = res?.user?.name || "Student";
          setSuccessToast(`Welcome back, ${studentName}. Redirecting to Student Portal...`);
          setTimeout(() => {
            navigate("/student/dashboard");
          }, 800);
        }
      }
    } catch (err) {
      console.error("[AnimatedAuth] Error:", err);
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
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
                setError("");
                setSuccessToast("");
                setRegisteredCode("");
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
                setSuccessToast("");
                setRegisteredCode("");
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
                ? `Create ${isTeacher ? "Faculty" : "Student"} Account`
                : `Sign In to ${isTeacher ? "Faculty Console" : "Student Portal"}`}
            </h2>
            <p className="form-subtitle">
              {isRegister
                ? `Enter your details to configure your ${isTeacher ? "faculty" : "student"} profile.`
                : `Welcome back. Enter your account credentials to access your dashboard.`}
            </p>
          </div>

          {/* Toast / Error / Success Code Display */}
          {error && <div className="form-error">{error}</div>}
          {successToast && (
            <div className="badge badge-success" style={{ padding: "12px", width: "100%", marginBottom: "16px", textTransform: "none", fontSize: "13px", display: "block", textAlign: "center" }}>
              {successToast}
            </div>
          )}

          {registeredCode ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                Your unique Student Access Code:
              </p>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: "700", color: "var(--color-accent)", padding: "12px", background: "var(--color-elevated)", borderRadius: "8px", marginBottom: "16px" }}>
                {registeredCode}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-full btn-lg"
                onClick={() => {
                  setMode("login");
                  setIdentity(registeredCode);
                  setRegisteredCode("");
                  setSuccessToast("");
                }}
              >
                Continue to Student Sign In →
              </button>
            </div>
          ) : (
            /* Clean Form */
            <form onSubmit={handleSubmit} className="auth-form-fields">
              {/* Full Name field (Only in Register mode) */}
              {isRegister && (
                <div className="form-group">
                  <label className="label">
                    {isTeacher ? "Faculty Full Name *" : "Student Full Name *"}
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required={isRegister}
                  />
                </div>
              )}

              {/* Identity / Email / Student Code */}
              <div className="form-group">
                <label className="label">
                  {isRegister
                    ? "Email Address *"
                    : isTeacher
                    ? "Staff User Code *"
                    : "Student Code or Email ID *"}
                </label>
                <input
                  className="input"
                  type={isRegister ? "email" : "text"}
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder={isRegister ? "student@university.edu" : isTeacher ? "e.g. TCH-5510 or staff code" : "e.g. STU-72XDA9"}
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
                  `Create ${isTeacher ? "Faculty" : "Student"} Account →`
                ) : (
                  `Sign In as ${isTeacher ? "Faculty" : "Student"} →`
                )}
              </button>
            </form>
          )}

          {/* Clean Bottom Mode Toggle Link */}
          <div className="form-footer-toggle">
            {isRegister ? (
              <span>
                Already registered?{" "}
                <button type="button" className="text-link-btn" onClick={() => { setMode("login"); setError(""); setSuccessToast(""); setRegisteredCode(""); }}>
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button type="button" className="text-link-btn" onClick={() => { setMode("register"); setError(""); setSuccessToast(""); setRegisteredCode(""); }}>
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
