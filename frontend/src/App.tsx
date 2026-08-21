import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";
import AdminDash from "./pages/AdminDash";
import StudentDash from "./pages/StudentDash";
import PanelistDash from "./pages/PanelistDash.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Authenticated Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDash />} />
          <Route path="/student" element={<StudentDash />} />
          <Route path="/panelist" element={<PanelistDash />} />

          {/* Future Admin sub-routes */}
          <Route
            path="/admin/placements"
            element={
              <div className="text-text-secondary">Placements View Pending</div>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <div className="text-text-secondary">Candidates View Pending</div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
