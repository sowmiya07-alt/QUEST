import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isStaff = user.role === "staff" || user.role === "teacher";
  const userCode = user.user_code || user.code || "USER";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">❖</span>
          <span>QUEST</span>
        </Link>

        <nav className="navbar-links">
          <Link
            to={isStaff ? "/staff/dashboard" : "/student/dashboard"}
            className={`navbar-link ${location.pathname.includes("dashboard") ? "active" : ""}`}
          >
            Dashboard
          </Link>
          {isStaff ? (
            <>
              <Link
                to="/staff/quiz/create"
                className={`navbar-link ${location.pathname === "/staff/quiz/create" ? "active" : ""}`}
              >
                Generate Quiz
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
          <div className="profile-menu">
            <button
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="profile-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
              <span className="profile-code">{userCode}</span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                <div className="profile-dropdown-header">
                  <span className="profile-name">{user.name}</span>
                  <span className="profile-role" style={{ textTransform: "capitalize" }}>{user.role} Account</span>
                  <span className="profile-usercode">ID: {userCode}</span>
                  {user.email && <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{user.email}</span>}
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
        </div>
      </div>
    </header>
  );
}
