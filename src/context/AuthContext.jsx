import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on application startup via GET /me/
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.getCurrentUser();
      if (res && res.user) {
        setUser(res.user);
      } else if (res && (res.user_code || res.role || res.name)) {
        setUser(res);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      if (!err.status || err.status !== 401) {
        console.warn("[AuthContext] Unable to verify current session:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Staff Login Flow (POST /staff/login/)
   */
  const loginAsStaff = async (credentials) => {
    setError(null);
    const res = await authService.loginStaff(credentials);
    if (res && res.user) {
      setUser(res.user);
    } else {
      await refreshUser();
    }
    return res;
  };

  /**
   * Student Login Flow (POST /student/login/)
   */
  const loginAsStudent = async (credentials) => {
    setError(null);
    const res = await authService.loginStudent(credentials);
    if (res && res.user) {
      setUser(res.user);
    } else {
      await refreshUser();
    }
    return res;
  };

  /**
   * Student Registration Flow (POST /student/register/)
   */
  const registerStudent = async (data) => {
    setError(null);
    const res = await authService.registerStudent(data);
    return res;
  };

  /**
   * Universal Login or Register Helper for UI components
   */
  const loginOrRegisterUser = async ({ name, identity, password, role, isRegister }) => {
    if (isRegister) {
      if (role === "student") {
        return await registerStudent({
          name: name || identity,
          email: identity,
          password
        });
      } else {
        throw new Error("Staff accounts must be provisioned by the system administrator.");
      }
    } else {
      if (role === "teacher" || role === "staff") {
        return await loginAsStaff({
          user_code: identity,
          password
        });
      } else {
        return await loginAsStudent({
          user_code: identity,
          password
        });
      }
    }
  };

  /**
   * Logout Flow (POST /logout/)
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("[AuthContext] Logout error:", err.message);
    } finally {
      setUser(null);
    }
  };

  const role = user?.role || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        role,
        isAuthenticated,
        loading,
        error,
        loginAsStaff,
        loginAsStudent,
        registerStudent,
        loginOrRegisterUser,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
