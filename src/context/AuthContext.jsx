import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export function getDisplayName(nameInput, fallbackIdentity = "") {
  let nameStr = "";
  if (typeof nameInput === "string") {
    nameStr = nameInput;
  } else if (nameInput && typeof nameInput === "object") {
    nameStr = nameInput.name || nameInput.username || nameInput.user_code || nameInput.email || "";
  }

  let fallbackStr = "";
  if (typeof fallbackIdentity === "string") {
    fallbackStr = fallbackIdentity;
  } else if (fallbackIdentity && typeof fallbackIdentity === "object") {
    fallbackStr = fallbackIdentity.email || fallbackIdentity.name || fallbackIdentity.user_code || "";
  }

  if (nameStr && typeof nameStr === "string" && nameStr.trim()) {
    const trimmed = nameStr.trim();
    if (trimmed.includes("@")) {
      const handle = trimmed.split("@")[0];
      const cleaned = handle.replace(/[0-9]/g, "");
      const formatted = cleaned || handle;
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  if (fallbackStr && typeof fallbackStr === "string" && fallbackStr.trim()) {
    const trimmed = fallbackStr.trim();
    if (trimmed.includes("@")) {
      const handle = trimmed.split("@")[0];
      const cleaned = handle.replace(/[0-9]/g, "");
      const formatted = cleaned || handle;
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  return "User";
}

const INITIAL_MOCK_QUIZZES = [
  {
    id: "q-101",
    code: "QUIZ-9081",
    title: "Data Structures & Algorithms Specification",
    description: "Comprehensive assessment covering Trees, Graphs, and Sorting complexity.",
    difficulty: "Medium",
    timeLimit: 15,
    createdDate: "2026-08-20",
    assigned: true,
    status: "ACTIVE",
    questionsCount: 5,
    questions: [
      {
        id: "q1",
        question: "What is the worst-case time complexity of QuickSort?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correctIndex: 1,
        explanation: "QuickSort exhibits O(n²) worst-case time complexity when the pivot selection consistently yields unbalanced partitions."
      },
      {
        id: "q2",
        question: "Which data structure uses LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Binary Tree", "Heap"],
        correctIndex: 1,
        explanation: "Stack operates strictly on LIFO principle where elements added last are popped first."
      },
      {
        id: "q3",
        question: "What is the height of a balanced binary tree with N nodes?",
        options: ["O(N)", "O(log N)", "O(N²)", "O(1)"],
        correctIndex: 1,
        explanation: "A balanced binary tree maintains a height bounded by O(log N)."
      }
    ]
  },
  {
    id: "q-102",
    code: "QUIZ-4412",
    title: "Machine Learning & Neural Network Fundamentals",
    description: "Diagnostic assessment on backpropagation, gradient descent, and cross-validation.",
    difficulty: "Tough",
    timeLimit: 20,
    createdDate: "2026-08-21",
    assigned: true,
    status: "ACTIVE",
    questionsCount: 4,
    questions: [
      {
        id: "q1",
        question: "Which loss function is commonly used for binary classification?",
        options: ["Mean Squared Error", "Binary Cross-Entropy", "Categorical Cross-Entropy", "Hinge Loss"],
        correctIndex: 1,
        explanation: "Binary Cross-Entropy penalizes probabilities based on distance from target label 0 or 1."
      },
      {
        id: "q2",
        question: "What is the primary function of an activation function in neural networks?",
        options: ["Scale inputs to zero", "Introduce non-linearity", "Prevent overfitting", "Calculate learning rate"],
        correctIndex: 1,
        explanation: "Activation functions introduce non-linear transformations enabling networks to learn complex patterns."
      }
    ]
  }
];

const INITIAL_MOCK_ATTEMPTS = [
  {
    id: "att-101",
    attempt_id: "att-101",
    student_code: "STU-8820",
    student_name: "Sowmiya",
    quiz_id: "q-101",
    quiz_title: "Data Structures & Algorithms Specification",
    submitted_at: "2026-08-22 14:15",
    score: 80,
    total: 5,
    total_questions: 5,
    correct_count: 4,
    wrong_count: 1,
    time_spent: "08:45"
  },
  {
    id: "att-102",
    attempt_id: "att-102",
    student_code: "STU-1002",
    student_name: "Rahul",
    quiz_id: "q-101",
    quiz_title: "Data Structures & Algorithms Specification",
    submitted_at: "2026-08-22 15:30",
    score: 60,
    total: 5,
    total_questions: 5,
    correct_count: 3,
    wrong_count: 2,
    time_spent: "11:20"
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("quest_active_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          parsed.name = getDisplayName(parsed.name, parsed.email);
        }
        return parsed;
      }
      return {
        id: "u-faculty-1",
        name: "Tamilselvam",
        email: "tamilselvam5884771@gmail.com",
        code: "FAC-901",
        role: "teacher"
      };
    } catch {
      return {
        id: "u-faculty-1",
        name: "Tamilselvam",
        email: "tamilselvam5884771@gmail.com",
        code: "FAC-901",
        role: "teacher"
      };
    }
  });

  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("quest_quizzes");
      return saved ? JSON.parse(saved) : INITIAL_MOCK_QUIZZES;
    } catch {
      return INITIAL_MOCK_QUIZZES;
    }
  });

  const [attempts, setAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem("quest_attempts");
      return saved ? JSON.parse(saved) : INITIAL_MOCK_ATTEMPTS;
    } catch {
      return INITIAL_MOCK_ATTEMPTS;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem("quest_active_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("quest_active_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("quest_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("quest_attempts", JSON.stringify(attempts));
  }, [attempts]);

  const addQuiz = (newQuiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const deleteQuiz = (quizIdTarget) => {
    setQuizzes((prev) => prev.filter((q) => String(q.id || q.quiz_id) !== String(quizIdTarget)));
  };

  const addAttempt = (newAttempt) => {
    setAttempts((prev) => [newAttempt, ...prev]);
  };

  const refreshUser = useCallback(async () => {
    setLoading(false);
  }, []);

  const loginAsStaff = async (credentials) => {
    setError(null);
    const resolvedName = getDisplayName(credentials.name || credentials.user_code, credentials.user_code);
    const loggedUser = {
      id: `u-${Date.now()}`,
      name: resolvedName,
      email: credentials.email || (credentials.user_code?.includes("@") ? credentials.user_code : `${credentials.user_code || "faculty"}@quest.edu`),
      code: credentials.user_code || "FAC-901",
      role: "teacher"
    };
    setUser(loggedUser);
    return { user: loggedUser };
  };

  const loginAsStudent = async (credentials) => {
    setError(null);
    const resolvedName = getDisplayName(credentials.name || credentials.user_code, credentials.user_code);
    const loggedUser = {
      id: `u-${Date.now()}`,
      name: resolvedName,
      email: credentials.email || (credentials.user_code?.includes("@") ? credentials.user_code : `${credentials.user_code || "student"}@quest.edu`),
      code: credentials.user_code || "STU-8820",
      role: "student"
    };
    setUser(loggedUser);
    return { user: loggedUser };
  };

  const registerStudent = async (data) => {
    setError(null);
    let userCode = "STU-" + Math.floor(1000 + Math.random() * 9000);
    const resolvedName = getDisplayName(data.name, data.email);
    const newUser = {
      id: `u-${Date.now()}`,
      name: resolvedName,
      email: data.email || "student@quest.edu",
      code: userCode,
      role: "student"
    };
    setUser(newUser);
    return { user: newUser, user_code: userCode };
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
        return await loginAsStaff({
          name: name || identity,
          user_code: identity,
          password
        });
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
    setUser(null);
    localStorage.removeItem("quest_active_user");
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
        quizzes,
        attempts,
        addQuiz,
        deleteQuiz,
        addAttempt,
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
