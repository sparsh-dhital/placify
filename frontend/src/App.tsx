import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "./components/ui/CustomCursor";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDash from "./pages/AdminDash";
import StudentDashboard from "./pages/student/Dashboard";
import PanelistDashboard from "./pages/panelist/Dashboard";
import JDAnalyzer from "./pages/admin/JDAnalyzer";
import Eligibility from "./pages/admin/Eligibility";
import Matching from "./pages/admin/Matching";
import Shortlist from "./pages/admin/Shortlist";
import Scheduler from "./pages/admin/Scheduler";
import Activity from "./pages/admin/Activity";
import Analytics from "./pages/admin/Analytics";
import Exceptions from "./pages/admin/Exceptions";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";

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
          <Route path="/admin/jds" element={<JDAnalyzer />} />
          <Route path="/admin/eligibility" element={<Eligibility />} />
          <Route path="/admin/matching" element={<Matching />} />
          <Route path="/admin/shortlist" element={<Shortlist />} />
          <Route path="/admin/schedule" element={<Scheduler />} />
          <Route path="/admin/activity" element={<Activity />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/exceptions" element={<Exceptions />} />
          <Route path="/student/resume" element={<ResumeAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
