import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isTeacher = user.role === "teacher";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span style={{ color: "var(--color-accent)", fontSize: "22px" }}>❖</span> QUEST
        </Link>

        <nav className="navbar-links">
          <Link
            to={isTeacher ? "/staff/dashboard" : "/student/dashboard"}
            className={`navbar-link ${location.pathname.includes("dashboard") ? "active" : ""}`}
          >
            Dashboard
          </Link>
          {isTeacher ? (
            <>
              <Link
                to="/staff/quiz/create"
                className={`navbar-link ${location.pathname === "/staff/quiz/create" ? "active" : ""}`}
              >
                Create Quiz
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/student/join"
                className={`navbar-link ${location.pathname === "/student/join" ? "active" : ""}`}
              >
                Join Quiz
              </Link>
              <Link
                to="/student/attempts"
                className={`navbar-link ${location.pathname === "/student/attempts" ? "active" : ""}`}
              >
                Previous Attempts
              </Link>
            </>
          )}
        </nav>

        <div className="navbar-right">
          {/* Quick role toggle button for testing ease */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "12px", border: "1px dashed var(--color-border)" }}
            onClick={() => {
              const target = isTeacher ? "student" : "teacher";
              switchRole(target);
              navigate(target === "teacher" ? "/staff/dashboard" : "/student/dashboard");
            }}
            title="Switch between Teacher and Student test views"
          >
            Switch to {isTeacher ? "Student" : "Teacher"} View
          </button>

          <div className="profile-menu">
            <button
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="profile-avatar">{user.name ? user.name[0] : "U"}</div>
              <span className="profile-code">{user.code}</span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                <div className="profile-dropdown-header">
                  <span className="profile-name">{user.name}</span>
                  <span className="profile-role">{user.role} Account</span>
                  <span className="profile-usercode">ID: {user.code}</span>
                </div>
                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
