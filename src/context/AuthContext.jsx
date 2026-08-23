import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("quest_active_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize active session on app startup with live Django backend
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getCurrentUser();
      const resolvedUser = res?.user || (res?.success && res) || (res?.id ? res : null);
      if (resolvedUser) {
        setUser(resolvedUser);
        localStorage.setItem("quest_active_user", JSON.stringify(resolvedUser));
      } else {
        setUser(null);
        localStorage.removeItem("quest_active_user");
      }
      return resolvedUser;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("quest_active_user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginAsStaff = async (credentials) => {
    setError(null);
    try {
      const res = await authService.loginStaff(credentials);
      const loggedUser = res?.user || (res?.id ? res : {
        user_code: credentials.user_code || credentials.identity,
        role: "staff"
      });
      setUser(loggedUser);
      localStorage.setItem("quest_active_user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      setError(err.message || "Failed to sign in as faculty.");
      throw err;
    }
  };

  const loginAsStudent = async (credentials) => {
    setError(null);
    try {
      const res = await authService.loginStudent(credentials);
      const loggedUser = res?.user || (res?.id ? res : {
        user_code: credentials.user_code || credentials.identity,
        role: "student"
      });
      setUser(loggedUser);
      localStorage.setItem("quest_active_user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      setError(err.message || "Failed to sign in as student.");
      throw err;
    }
  };

  const registerStudent = async (data) => {
    setError(null);
    try {
      const res = await authService.registerStudent(data);
      const newUser = res?.user || (res?.id ? res : {
        name: data.name,
        email: data.email,
        role: "student"
      });
      setUser(newUser);
      localStorage.setItem("quest_active_user", JSON.stringify(newUser));
      return { success: true, user: newUser, user_code: newUser.user_code };
    } catch (err) {
      setError(err.message || "Registration failed.");
      throw err;
    }
  };

  const loginOrRegisterUser = async ({ name, identity, password, role, isRegister }) => {
    if (isRegister) {
      if (role === "student") {
        return await registerStudent({
          name: name || identity,
          email: identity,
          password
        });
      } else {
        throw new Error("Faculty accounts are administered by the platform. Please sign in.");
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

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("[AuthContext] Logout call failed or already expired:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("quest_active_user");
    }
  };

  const role = user?.role || (user?.role === "teacher" ? "staff" : null);
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
