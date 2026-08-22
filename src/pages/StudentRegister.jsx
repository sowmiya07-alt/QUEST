import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registeredCode, setRegisteredCode] = useState("");
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = registerStudent(name, email);
    setRegisteredCode(newUser.code);
  };

  return (
    <div className="auth-shell">
      <div className="auth-background" />
      <div className="auth-card-wrapper">
        <Link to="/" className="auth-logo">❖ QUEST</Link>
        <div className="auth-card">
          <h2 className="auth-heading">Student Registration</h2>
          <p className="auth-subheading">Create your student account to access assessments</p>

          {registeredCode ? (
            <div className="register-success">
              <div className="badge badge-success" style={{ fontSize: "14px", padding: "6px 14px" }}>✓ Account Created</div>
              <p>Your unique Student Access Code is:</p>
              <div style={{ background: "var(--color-elevated)", padding: "12px", borderRadius: "8px", width: "100%", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "700" }}>
                {registeredCode}
              </div>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate("/student/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: "12px" }}>
                Generate Student Code & Sign Up
              </button>
            </form>
          )}

          <div className="auth-footer">
            Already registered? <Link to="/student/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
