import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user, loginAsTeacher, loginAsStudent } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <section className="hero-section">
          <div className="badge badge-accent">Interactive Assessment Platform</div>
          <h1 className="hero-title">Turn knowledge into assessment.</h1>
          <p className="hero-subtitle">
            QUEST empowers educators with AI-driven specification tools and offers students seamless, instant quiz evaluation with real-time feedback.
          </p>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            {user ? (
              <Link
                to={user.role === "teacher" ? "/staff/dashboard" : "/student/dashboard"}
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard ({user.role}) →
              </Link>
            ) : (
              <>
                <Link to="/student/login" className="btn btn-primary btn-lg">
                  Student Portal
                </Link>
                <Link to="/staff/login" className="btn btn-secondary btn-lg">
                  Staff / Teacher Portal
                </Link>
              </>
            )}
          </div>
        </section>

        <section style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "22px", marginBottom: "20px", textAlign: "center" }}>Core Platform Capabilities</h2>
          <div className="grid-cards">
            <div className="card">
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>AI Terminal Specification</h3>
              <p style={{ fontSize: "14px" }}>
                Generate precise quiz questions and rubrics using prompt specifications directly in an integrated terminal workflow.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎯</div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Instant Diagnostic Feedback</h3>
              <p style={{ fontSize: "14px" }}>
                Students receive instantaneous score breakdowns and step-by-step wrong answer reviews with clear explanations.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Role-Based Access Control</h3>
              <p style={{ fontSize: "14px" }}>
                Distinct security boundaries for students and staff with unique access codes and state management.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
