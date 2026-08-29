// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import CustomCursor from "./components/ui/CustomCursor";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import StudentLayout from "./components/layout/StudentLayout";
import PanelistLayout from "./components/layout/PanelistLayout";
import AdminDash from "./pages/AdminDash";
import StudentDashboard from "./pages/student/Dashboard";
import PanelistDashboard from "./pages/panelist/Dashboard";
import StudentFeature from "./pages/student/Feature";
import AdminActivity from "./pages/admin/Activity";
import Analytics from "./pages/admin/Analytics";
import Communications from "./pages/admin/Communications";
import Eligibility from "./pages/admin/Eligibility";
import Exceptions from "./pages/admin/Exceptions";
import JDAnalyzer from "./pages/admin/JDAnalyzer";
import Matching from "./pages/admin/Matching";
import Panelists from "./pages/admin/Panelists";
import Scheduler from "./pages/admin/Scheduler";
import Shortlist from "./pages/admin/Shortlist";

// ==========================================
// SECURITY GUARD: Protected Route Wrapper
// ==========================================
function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const token = localStorage.getItem("placify_token");
  const userStr = localStorage.getItem("placify_user");

  // 1. Check if user is logged in at all
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const userRole = user.role?.toLowerCase();

    // 2. Check if the logged-in user has permission for this workspace
    if (!allowedRoles.includes(userRole)) {
      // Redirect unauthorized users back to their proper dashboard
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "panelist") return <Navigate to="/panelist" replace />;
      return <Navigate to="/student" replace />;
    }
  } catch {
    // Fallback if local storage is corrupted
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      {/* Global Awwwards Custom Cursor */}
      <CustomCursor />
      <Routes>
        {/* Public Default Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* ========================================== */}
        {/* PROTECTED ADMIN / PLACEMENT OFFICER ROUTES */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDash />} />
            <Route path="/admin/placements" element={<Shortlist />} />
            <Route path="/admin/candidates" element={<Eligibility />} />
            <Route path="/admin/jds" element={<JDAnalyzer />} />
            <Route path="/admin/matching" element={<Matching />} />
            <Route path="/admin/interviews" element={<Scheduler />} />
            <Route path="/admin/panelists" element={<Panelists />} />
            <Route path="/admin/communications" element={<Communications />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/exceptions" element={<Exceptions />} />
          </Route>
        </Route>

        {/* ========================================== */}
        {/* PROTECTED STUDENT PORTAL ROUTES            */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route
              path="/student/resume"
              element={<StudentFeature type="resume" />}
            />
            <Route
              path="/student/opportunities"
              element={<StudentFeature type="opportunities" />}
            />
            <Route
              path="/student/interviews"
              element={<StudentFeature type="interviews" />}
            />
            <Route
              path="/student/readiness"
              element={<StudentFeature type="readiness" />}
            />
          </Route>
        </Route>

        {/* ========================================== */}
        {/* PROTECTED PANELIST WORKSPACE ROUTES        */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["panelist"]} />}>
          <Route element={<PanelistLayout />}>
            <Route path="/panelist" element={<PanelistDashboard />} />
          </Route>
        </Route>

        {/* Catch-all route for any non-existent slug */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
