import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "./components/ui/CustomCursor";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDash from "./pages/AdminDash";
import StudentDashboard from "./pages/student/Dashboard";
import PanelistDashboard from "./pages/panelist/Dashboard";
import AdminActivity from "./pages/admin/Activity";
import Analytics from "./pages/admin/Analytics";
import Eligibility from "./pages/admin/Eligibility";
import Exceptions from "./pages/admin/Exceptions";
import JDAnalyzer from "./pages/admin/JDAnalyzer";
import Matching from "./pages/admin/Matching";
import Scheduler from "./pages/admin/Scheduler";
import Shortlist from "./pages/admin/Shortlist";

function App() {
  return (
    <BrowserRouter>
      {/* Global Awwwards Custom Cursor */}
      <CustomCursor />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Authenticated Command Center Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDash />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/panelist" element={<PanelistDashboard />} />
          <Route path="/admin/placements" element={<Shortlist />} />
          <Route path="/admin/candidates" element={<Eligibility />} />
          <Route path="/admin/jds" element={<JDAnalyzer />} />
          <Route path="/admin/matching" element={<Matching />} />
          <Route path="/admin/interviews" element={<Scheduler />} />
          <Route path="/admin/panelists" element={<AdminActivity />} />
          <Route path="/admin/communications" element={<AdminActivity />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/exceptions" element={<Exceptions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;