import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        <section className="hero-section">
          <div className="hero-glow-bg" />
          
          <div className="hero-badge">
            <span className="pulse-dot" />
            <span>Interactive Assessment Engine</span>
          </div>

          <h1 className="hero-title">
            Turn knowledge into <span className="gradient-text">interactive assessment.</span>
          </h1>

          <p className="hero-subtitle">
            QUEST empowers educators with AI-driven specification terminals and offers students instant quiz evaluation with real-time feedback.
          </p>

          {user && (
            <div className="hero-actions">
              <Link
                to={user.role === "teacher" ? "/staff/dashboard" : "/student/dashboard"}
                className="btn btn-primary btn-lg hero-btn-primary"
              >
                Go to {user.role === "teacher" ? "Faculty Console" : "Student Dashboard"} ({user.name}) →
              </Link>
            </div>
          )}
        </section>

        {/* Core Platform Capabilities Section */}
        <section className="features-section">
          <div className="features-header">
            <span className="badge badge-accent">Platform Highlights</span>
            <h2 className="features-title">Core Platform Capabilities</h2>
            <p className="features-subtitle">Everything you need to create, conduct, and analyze assessments seamlessly.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card card-amber">
              <div className="feature-card-top">
                <div className="feature-icon-wrapper icon-amber">
                  <span className="feature-icon">⚡</span>
                </div>
                <span className="badge badge-amber">Faculty CLI</span>
              </div>
              <h3 className="feature-card-title">AI Terminal Specification</h3>
              <p className="feature-card-desc">
                Generate precise quiz questions and rubrics using prompt specifications directly in an integrated terminal workflow.
              </p>
            </div>

            <div className="feature-card card-blue">
              <div className="feature-card-top">
                <div className="feature-icon-wrapper icon-blue">
                  <span className="feature-icon">🎯</span>
                </div>
                <span className="badge badge-blue">Instant Feedback</span>
              </div>
              <h3 className="feature-card-title">Diagnostic Score Cards</h3>
              <p className="feature-card-desc">
                Students receive instantaneous score breakdowns and step-by-step wrong answer reviews with clear explanations.
              </p>
            </div>

            <div className="feature-card card-emerald">
              <div className="feature-card-top">
                <div className="feature-icon-wrapper icon-emerald">
                  <span className="feature-icon">🔒</span>
                </div>
                <span className="badge badge-emerald">Strict Auth</span>
              </div>
              <h3 className="feature-card-title">Role-Based Access Control</h3>
              <p className="feature-card-desc">
                Distinct security boundaries for students and staff with unique login access IDs and real-time state management.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
