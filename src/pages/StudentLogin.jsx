import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentLogin() {
  const [code, setCode] = useState("STU-9482");
  const [name, setName] = useState("Jordan Lee");
  const { loginAsStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAsStudent(code || "STU-9482", name || "Jordan Lee");
    navigate("/student/dashboard");
  };

  return (
    <div className="auth-shell">
      <div className="auth-background" />
      <div className="auth-card-wrapper">
        <Link to="/" className="auth-logo">❖ QUEST</Link>
        <div className="auth-card">
          <h2 className="auth-heading">Student Sign In</h2>
          <p className="auth-subheading">Enter your student credentials or join code</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Student Code / ID</label>
              <input
                className="input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. STU-9482"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: "12px" }}>
              Sign In to Student Portal
            </button>
          </form>

          <div className="auth-footer-multi">
            <span>New student? <Link to="/student/register">Register here</Link></span>
            <span>Are you a faculty member? <Link to="/staff/login">Staff Login</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
