import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const MOCK_QUIZZES = [
  {
    id: "q-101",
    code: "REACT2024",
    title: "React Fundamentals & State Architecture",
    description: "Assess knowledge on hooks, virtual DOM, component lifecycles, and context API.",
    timeLimit: 15, // minutes
    createdDate: "2026-08-20",
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
    timeLimit: 20,
    createdDate: "2026-08-21",
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
    studentCode: "STU-9482"
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("quest_user");
    return saved ? JSON.parse(saved) : { name: "Alex Morgan", role: "teacher", code: "TCH-5510", email: "teacher@quest.edu" };
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("quest_quizzes");
    return saved ? JSON.parse(saved) : MOCK_QUIZZES;
  });

  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem("quest_attempts");
    return saved ? JSON.parse(saved) : INITIAL_ATTEMPTS;
  });

  useEffect(() => {
    localStorage.setItem("quest_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("quest_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("quest_attempts", JSON.stringify(attempts));
  }, [attempts]);

  const loginAsTeacher = (email = "teacher@quest.edu", name = "Prof. Morgan") => {
    const u = { name, role: "teacher", code: "TCH-5510", email };
    setUser(u);
    return u;
  };

  const loginAsStudent = (code = "STU-9482", name = "Jordan Lee") => {
    const u = { name, role: "student", code, email: "student@quest.edu" };
    setUser(u);
    return u;
  };

  const registerStudent = (name, email) => {
    const code = "STU-" + Math.floor(1000 + Math.random() * 9000);
    const u = { name, role: "student", code, email };
    setUser(u);
    return u;
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

  const addQuiz = (newQuiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const addAttempt = (attempt) => {
    setAttempts((prev) => [attempt, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        quizzes,
        attempts,
        loginAsTeacher,
        loginAsStudent,
        registerStudent,
        logout,
        switchRole,
        addQuiz,
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
