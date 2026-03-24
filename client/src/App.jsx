import React, { useState } from 'react';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// ─── Error Boundary ───────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-xl border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <div className="bg-slate-100 p-4 rounded overflow-auto mb-4">
              <code className="text-sm text-red-500 block mb-2">{this.state.error && this.state.error.toString()}</code>
              <pre className="text-xs text-slate-500">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Mock Students (Master List — 10 students) ───────────────
const INITIAL_STUDENTS = [
  { _id: '1', id: 1, username: "Alice Johnson", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 12, email: "alice@school.edu", avatar: "👩‍🎓" },
  { _id: '2', id: 2, username: "Bob Smith", grade: "10-B", risk: "High", status: "Sad", level: 2, streak: 0, email: "bob@school.edu", avatar: "👨‍🎓" },
  { _id: '3', id: 3, username: "Charlie Brown", grade: "10-A", risk: "Medium", status: "Tired", level: 3, streak: 4, email: "charlie@school.edu", avatar: "🧑‍🎓" },
  { _id: '4', id: 4, username: "Diana Prince", grade: "11-C", risk: "Low", status: "Happy", level: 4, streak: 8, email: "diana@school.edu", avatar: "🦸‍♀️" },
  { _id: '5', id: 5, username: "Evan Wright", grade: "10-B", risk: "High", status: "Anxious", level: 1, streak: 0, email: "evan@school.edu", avatar: "🏃‍♂️" },
  { _id: '6', id: 6, username: "Fiona Gallagher", grade: "11-A", risk: "Medium", status: "Stressed", level: 2, streak: 2, email: "fiona@school.edu", avatar: "🎨" },
  { _id: '7', id: 7, username: "George Martin", grade: "12-B", risk: "Low", status: "Calm", level: 3, streak: 15, email: "george@school.edu", avatar: "🦁" },
  { _id: '8', id: 8, username: "Hannah Lee", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 20, email: "hannah@school.edu", avatar: "⛸️" },
  { _id: '9', id: 9, username: "Ian Curtis", grade: "12-A", risk: "High", status: "Sad", level: 1, streak: 0, email: "ian@school.edu", avatar: "🎸" },
  { _id: '10', id: 10, username: "Julia Roberts", grade: "11-B", risk: "Medium", status: "Tired", level: 3, streak: 3, email: "julia@school.edu", avatar: "🎭" },
];

// ─── App Component (Global State Manager) ─────────────────────
function App() {
  const { user, logout, loading } = useAuth();

  // State 2: Global Students (Master List)
  const [globalStudents, setGlobalStudents] = useState([]);

  // Fetch students if user is teacher
  React.useEffect(() => {
    const fetchStudents = async () => {
      if (user && user.role === 'teacher') {
        try {
          const res = await fetch('/api/auth/students', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            // Merge with some mock attributes for UI (status, risk etc if missing)
            const enriched = data.map((s, idx) => ({
              ...s,
              risk: s.risk || (idx % 3 === 0 ? "High" : "Low"),
              status: s.status || (idx % 2 === 0 ? "Happy" : "Stressed"),
              level: s.level || 1,
              streak: s.streak || 0,
              avatar: s.avatar || (idx % 2 === 0 ? "👨‍🎓" : "👩‍🎓")
            }));

            // Fallback: If no real students registered yet, show mock ones so dashboard isn't empty
            if (enriched.length === 0) {
              setGlobalStudents(INITIAL_STUDENTS);
            } else {
              setGlobalStudents(enriched);
            }
          }
        } catch (error) {
          console.error("Error fetching students:", error);
          setGlobalStudents(INITIAL_STUDENTS);
        }
      }
    };

    fetchStudents();
  }, [user]);

  // Function: Add New Student → appends to globalStudents AND persists
  const addNewStudent = (student) => {
    // Duplicate check
    const exists = globalStudents.some(s =>
      s.email?.toLowerCase() === student.email?.toLowerCase() ||
      s.username?.toLowerCase() === student.username?.toLowerCase()
    );
    if (exists) return false;

    const updatedStudents = [...globalStudents, student];
    setGlobalStudents(updatedStudents);

    // Persist custom students to localStorage
    const customOnly = updatedStudents.filter(
      s => !INITIAL_STUDENTS.some(init => init.email === s.email)
    );
    localStorage.setItem('custom_students', JSON.stringify(customOnly));
    return true;
  };

  // Function: Update Student
  const handleUpdateStudent = (updatedStudent) => {
    setGlobalStudents(prev => prev.map(s => 
        (s._id === updatedStudent._id || s.id === updatedStudent._id) ? { ...s, ...updatedStudent } : s
    ));
  };

  // Login/Logout is now handled by AuthContext, so we don't need manual setters here
  const handleLogout = () => {
    logout();
  };

  // Function: Handle SOS Trigger
  const handleSOS = (studentName) => {
    console.log("[App] SOS triggered by:", studentName);
  };

  // Render based on user auth state
  const renderView = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3F6FD]">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (!user) {
      return <Login />; // Login handles the AuthContext internally now
    }

    if (user.role === 'teacher') {
      return (
        <TeacherDashboard
          students={globalStudents}
          onAddStudent={addNewStudent}
          onUpdateStudent={handleUpdateStudent}
          onLogout={handleLogout}
          alerts={[]}
        />
      );
    }

    return (
      <StudentDashboard
        onLogout={handleLogout}
        onTriggerSOS={handleSOS}
      />
    );
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      {renderView()}
    </ErrorBoundary>
  );
}

export default App;
