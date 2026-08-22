import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TeacherLogin() {
  const [email, setEmail] = useState("teacher@quest.edu");
  const [name, setName] = useState("Prof. Alex Morgan");
  const { loginAsTeacher } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAsTeacher(email, name);
    navigate("/staff/dashboard");
  };

  return (
    <div className="auth-shell">
      <div className="auth-background" />
      <div className="auth-card-wrapper">
        <Link to="/" className="auth-logo">❖ QUEST</Link>
        <div className="auth-card">
          <h2 className="auth-heading">Staff & Educator Portal</h2>
          <p className="auth-subheading">Sign in to manage assessments and AI specifications</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Faculty Name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prof. Alex Morgan"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Institutional Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: "12px" }}>
              Sign In to Staff Dashboard
            </button>
          </form>

          <div className="auth-footer">
            Are you a student? <Link to="/student/login">Student Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
