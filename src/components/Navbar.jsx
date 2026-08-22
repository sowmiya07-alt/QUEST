import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, getDisplayName } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacher = user?.role === "teacher";
  const displayName = getDisplayName(user);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">❖</span>
          <span>QUEST</span>
        </Link>

        {user ? (
          <nav className="navbar-links">
            <Link
              to={isTeacher ? "/staff/dashboard" : "/student/dashboard"}
              className={`navbar-link ${location.pathname.includes("dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
            {isTeacher ? (
              <Link
                to="/staff/quiz/create"
                className={`navbar-link ${location.pathname === "/staff/quiz/create" ? "active" : ""}`}
              >
                Generate Quiz
              </Link>
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
        ) : (
          <div className="navbar-links" />
        )}

        <div className="navbar-right">
          {user ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="profile-avatar">{displayName ? displayName[0].toUpperCase() : "U"}</div>
                <span className="profile-code" style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                  {displayName}
                </span>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                  <div className="profile-dropdown-header">
                    <span className="profile-name">{displayName}</span>
                    <span className="profile-role">{user.role?.toUpperCase()} ACCOUNT</span>
                    <span className="profile-usercode">ID: {user.code || user.identity || user.email}</span>
                  </div>
                  <button
                    className="profile-dropdown-item"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link to="/student/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/student/register" className="btn btn-primary btn-sm">
                Register →
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
