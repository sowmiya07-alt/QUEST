import React, { createContext, useContext, useState, useEffect } from "react";
import {
  apiFetchQuizzes,
  apiCreateQuiz,
  apiUpdateQuiz,
  apiSubmitAttempt,
  apiFetchAttempts,
} from "../api";

const AuthContext = createContext();

const MOCK_QUIZZES = [
  {
    id: "q-101",
    code: "REACT2024",
    title: "React Fundamentals & State Architecture",
    description: "Assess knowledge on hooks, virtual DOM, component lifecycles, and context API.",
    difficulty: "Medium",
    timeLimit: 15,
    createdDate: "2026-08-20",
    assigned: true,
    questionsCount: 4,
    questions: [
      {
        id: "q1",
        question: "What is the primary function of React's useMemo hook?",
        options: [
          "To subscribe to external data stores",
          "To cache calculation results between re-renders",
          "To trigger side effects after component mounting",
          "To handle DOM element refs directly"
        ],
        correctIndex: 1,
        explanation: "useMemo caches the result of a calculation between re-renders to prevent expensive recalculations."
      },
      {
        id: "q2",
        question: "Which of the following is true about Virtual DOM?",
        options: [
          "It completely replaces the real browser DOM",
          "It is a lightweight copy of the real DOM in memory",
          "It directly executes GPU rendering pipelines",
          "It only works with Server-Side Rendering"
        ],
        correctIndex: 1,
        explanation: "The Virtual DOM is a lightweight JS representation of DOM trees used by React to compute minimal real DOM updates."
      },
      {
        id: "q3",
        question: "In Strict Mode, why do component render functions execute twice in development?",
        options: [
          "To double the application speed",
          "To detect unexpected side effects and purity violations",
          "It is a bug in React 18",
          "To preload upcoming route chunks"
        ],
        correctIndex: 1,
        explanation: "Double rendering helps spot accidental side-effects during render phase in development."
      },
      {
        id: "q4",
        question: "What happens when setState is passed a function updater instead of a value?",
        options: [
          "It causes an immediate synchronous DOM repaint",
          "It receives the most up-to-date state as its argument",
          "It automatically resets state to initial value",
          "It creates an infinite loop by default"
        ],
        correctIndex: 1,
        explanation: "Functional state updates receive the current pending state, ensuring safe sequential updates."
      }
    ]
  },
  {
    id: "q-102",
    code: "PYTHON301",
    title: "Advanced Data Structures & Algorithms in Python",
    description: "Deep dive into time complexity, memory allocation, and custom data structures.",
    difficulty: "Tough",
    timeLimit: 20,
    createdDate: "2026-08-21",
    assigned: true,
    questionsCount: 3,
    questions: [
      {
        id: "pq1",
        question: "What is the average time complexity of searching in a Python set?",
        options: ["O(N)", "O(log N)", "O(1)", "O(N log N)"],
        correctIndex: 2,
        explanation: "Python sets are implemented as hash tables, giving them average O(1) time complexity for membership checks."
      },
      {
        id: "pq2",
        question: "Which built-in module provides a double-ended queue with O(1) appends and pops?",
        options: ["queue", "collections (deque)", "heapq", "sys"],
        correctIndex: 1,
        explanation: "collections.deque is optimized for fast O(1) appends and pops from both ends."
      },
      {
        id: "pq3",
        question: "What does the `__slots__` attribute do in a Python class?",
        options: [
          "Restricts attribute creation and saves memory",
          "Enables automatic async/await support",
          "Makes class instances immutable",
          "Generates getter and setter methods"
        ],
        correctIndex: 0,
        explanation: "__slots__ prevents dynamic __dict__ creation, reducing memory footprint per object."
      }
    ]
  }
];

const INITIAL_ATTEMPTS = [
  {
    attemptId: "att-881",
    quizId: "q-101",
    quizTitle: "React Fundamentals & State Architecture",
    score: 75,
    total: 4,
    correctCount: 3,
    date: "2026-08-22 10:30 AM",
    answers: { q1: 1, q2: 1, q3: 0, q4: 1 },
    studentCode: "STU-9482",
    studentName: "Jordan Lee"
  }
];

export function AuthProvider({ children }) {
  // Default user is null so opening the app lands on the landing page
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("quest_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem("quest_registered_users");
    return saved ? JSON.parse(saved) : [];
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("quest_quizzes");
    return saved ? JSON.parse(saved) : MOCK_QUIZZES;
  });

  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem("quest_attempts");
    return saved ? JSON.parse(saved) : INITIAL_ATTEMPTS;
  });

  // Fetch initial data from Django backend if available
  useEffect(() => {
    async function initFromBackend() {
      const backendQuizzes = await apiFetchQuizzes();
      if (backendQuizzes && Array.isArray(backendQuizzes) && backendQuizzes.length > 0) {
        setQuizzes(backendQuizzes);
      }
      const backendAttempts = await apiFetchAttempts();
      if (backendAttempts && Array.isArray(backendAttempts) && backendAttempts.length > 0) {
        setAttempts(backendAttempts);
      }
    }
    initFromBackend();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("quest_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("quest_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("quest_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem("quest_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("quest_attempts", JSON.stringify(attempts));
  }, [attempts]);

  /**
   * Universal Login or First-Time Account Creation Helper
   * Requires user-entered credentials. No default dummy email or password fallbacks.
   */
  const loginOrRegisterUser = ({ name, identity, password, role }) => {
    const trimmedIdentity = identity ? identity.trim() : "";
    if (!trimmedIdentity || !password) {
      throw new Error("Login ID and Password are required.");
    }

    const existing = registeredUsers.find(
      (u) => u.identity.toLowerCase() === trimmedIdentity.toLowerCase() && u.role === role
    );

    if (existing) {
      if (existing.password && existing.password !== password) {
        throw new Error("Invalid password for existing account.");
      }
      setUser(existing);
      return { user: existing, isNew: false };
    } else {
      const userCode = trimmedIdentity.toUpperCase();
      const newUser = {
        name: name ? name.trim() : trimmedIdentity,
        identity: trimmedIdentity,
        email: trimmedIdentity,
        code: userCode,
        role,
        password: password,
        createdAt: new Date().toISOString()
      };

      setRegisteredUsers((prev) => [newUser, ...prev]);
      setUser(newUser);
      return { user: newUser, isNew: true };
    }
  };

  const loginAsTeacher = (email, name, password) => {
    return loginOrRegisterUser({ name, identity: email, password, role: "teacher" }).user;
  };

  const loginAsStudent = (code, name, password) => {
    return loginOrRegisterUser({ name, identity: code, password, role: "student" }).user;
  };

  const registerStudent = (name, email, password) => {
    return loginOrRegisterUser({ name, identity: email, password, role: "student" }).user;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role) => {
    if (role === "teacher") {
      loginAsTeacher();
    } else {
      loginAsStudent();
    }
  };

  const addQuiz = async (newQuiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
    await apiCreateQuiz(newQuiz);
  };

  const updateQuiz = async (quizId, updatedFields) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, ...updatedFields } : q))
    );
    await apiUpdateQuiz(quizId, updatedFields);
  };

  const addAttempt = async (attempt) => {
    setAttempts((prev) => [attempt, ...prev]);
    await apiSubmitAttempt(attempt);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        quizzes,
        attempts,
        loginOrRegisterUser,
        loginAsTeacher,
        loginAsStudent,
        registerStudent,
        logout,
        switchRole,
        addQuiz,
        updateQuiz,
        addAttempt
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
