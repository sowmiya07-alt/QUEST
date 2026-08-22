import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("terminal");

  const isTeacher = user?.role === "teacher";

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content container">
        {/* Ambient Hero Section */}
        <section className="hero-section">
          <div className="hero-glow-bg" />

          <div className="badge badge-accent hero-badge">
            <span className="pulse-dot" /> Interactive Assessment Platform v2.4
          </div>

          <h1 className="hero-title">
            Turn knowledge into <span className="gradient-text">assessment.</span>
          </h1>

          <p className="hero-subtitle">
            QUEST empowers educators with AI-driven specification tools and offers students seamless, instant quiz evaluation with real-time feedback.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link
                  to={isTeacher ? "/staff/dashboard" : "/student/dashboard"}
                  className="btn btn-primary btn-lg hero-btn-primary"
                >
                  Go to {isTeacher ? "Faculty Console" : "Student Portal"} →
                </Link>
                <Link
                  to={isTeacher ? "/staff/quiz/create/terminal" : "/student/join"}
                  className="btn btn-secondary btn-lg"
                >
                  {isTeacher ? "💻 Launch AI Terminal" : "🔑 Join Quiz with Code"}
                </Link>
              </>
            ) : (
              <>
                <Link to="/student/login" className="btn btn-primary btn-lg hero-btn-primary">
                  Student Portal →
                </Link>
                <Link to="/staff/login" className="btn btn-secondary btn-lg">
                  Staff / Faculty Portal →
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Cards Grid */}
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
                <span className="badge badge-amber">CLI PROMPTS</span>
              </div>
              <h3 className="feature-card-title">AI Terminal Specification</h3>
              <p className="feature-card-desc">
                Generate precise quiz questions and rubrics using prompt specifications directly in an integrated terminal workflow.
              </p>
              <Link to={isTeacher ? "/staff/quiz/create/terminal" : "/student/login"} className="feature-card-link">
                <span>Explore Terminal Spec</span> <span className="arrow-icon">→</span>
              </Link>
            </div>

            <div className="feature-card card-blue">
              <div className="feature-card-top">
                <div className="feature-icon-wrapper icon-blue">
                  <span className="feature-icon">🎯</span>
                </div>
                <span className="badge badge-blue">REAL-TIME REVIEWS</span>
              </div>
              <h3 className="feature-card-title">Instant Diagnostic Feedback</h3>
              <p className="feature-card-desc">
                Students receive instantaneous score breakdowns and step-by-step wrong answer reviews with clear explanations.
              </p>
              <Link to={user ? "/student/attempts" : "/student/login"} className="feature-card-link">
                <span>View Feedback Sample</span> <span className="arrow-icon">→</span>
              </Link>
            </div>

            <div className="feature-card card-emerald">
              <div className="feature-card-top">
                <div className="feature-icon-wrapper icon-emerald">
                  <span className="feature-icon">🔒</span>
                </div>
                <span className="badge badge-emerald">ISOLATED ROLES</span>
              </div>
              <h3 className="feature-card-title">Role-Based Access Control</h3>
              <p className="feature-card-desc">
                Distinct security boundaries for students and staff with unique access codes and state management.
              </p>
              <Link to="/staff/login" className="feature-card-link">
                <span>Faculty Access Control</span> <span className="arrow-icon">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Platform Preview Section */}
        <section className="preview-demo-section">
          <div className="features-header">
            <span className="badge badge-accent">Interactive Preview</span>
            <h2 className="features-title">Experience the QUEST Workflow</h2>
            <p className="features-subtitle">Click through the live interface previews below.</p>
          </div>

          <div className="demo-tabs-container">
            <div className="demo-tabs-header">
              <button
                className={`demo-tab-btn ${activeTab === "terminal" ? "active" : ""}`}
                onClick={() => setActiveTab("terminal")}
              >
                💻 AI Spec Terminal
              </button>
              <button
                className={`demo-tab-btn ${activeTab === "review" ? "active" : ""}`}
                onClick={() => setActiveTab("review")}
              >
                🎯 Diagnostic Review
              </button>
              <button
                className={`demo-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => setActiveTab("analytics")}
              >
                📊 Faculty Analytics
              </button>
            </div>

            <div className="demo-tab-content">
              {activeTab === "terminal" && (
                <div className="demo-preview-card">
                  <div className="demo-code-header">
                    <span className="demo-dot red" />
                    <span className="demo-dot yellow" />
                    <span className="demo-dot green" />
                    <span className="demo-title">quest-ai-cli ~ prompt runner</span>
                  </div>
                  <div className="demo-code-body">
                    <div className="demo-code-line"><span className="cyan">$</span> quest-ai generate --spec "3 React State questions"</div>
                    <div className="demo-code-line muted">&gt; Parsing domain topics & generating schema...</div>
                    <div className="demo-code-line green">✔ Created Assessment [CODE: REACT2024]</div>
                    <div className="demo-code-line">1. What is the primary function of React's useMemo hook?</div>
                    <div className="demo-code-line indent muted">A) To subscribe to external data stores</div>
                    <div className="demo-code-line indent green">B) To cache calculation results between re-renders ✓</div>
                  </div>
                </div>
              )}

              {activeTab === "review" && (
                <div className="demo-preview-card">
                  <div className="demo-review-header">
                    <span className="badge badge-success">Score: 75%</span>
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Diagnostic Answer Breakdown</span>
                  </div>
                  <div className="demo-review-body">
                    <div className="demo-review-q">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong>Question 1: What is the Virtual DOM?</strong>
                        <span className="badge badge-success">Correct ✓</span>
                      </div>
                      <p className="muted" style={{ fontSize: "13px" }}>
                        Selected: A lightweight copy of real DOM in memory.
                      </p>
                    </div>
                    <div className="demo-review-q">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong>Question 2: Why double render in StrictMode?</strong>
                        <span className="badge badge-danger">Incorrect ✗</span>
                      </div>
                      <div className="demo-explanation">
                        <strong>Explanation:</strong> Double rendering helps detect unexpected side-effects during render phase.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="demo-preview-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0 }}>Class Submission Summary</h4>
                    <span className="badge badge-accent">Average: 82%</span>
                  </div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student Code</th>
                          <th>Quiz Code</th>
                          <th>Score</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontFamily: "var(--font-mono)" }}>STU-9482</td>
                          <td style={{ fontFamily: "var(--font-mono)" }}>REACT2024</td>
                          <td>75%</td>
                          <td><span className="badge badge-success">Passed</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontFamily: "var(--font-mono)" }}>STU-3104</td>
                          <td style={{ fontFamily: "var(--font-mono)" }}>REACT2024</td>
                          <td>90%</td>
                          <td><span className="badge badge-success">Passed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner Section */}
        <section className="cta-banner-section">
          <div className="cta-banner-card">
            <div className="cta-banner-content">
              <h2 className="cta-title">Ready to transform your assessment workflow?</h2>
              <p className="cta-desc">Start building AI prompt specifications or join an assessment room immediately.</p>
            </div>
            <div className="cta-banner-buttons">
              <Link to={user ? (isTeacher ? "/staff/dashboard" : "/student/dashboard") : "/student/login"} className="btn btn-primary btn-lg hero-btn-primary">
                Get Started Now →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
