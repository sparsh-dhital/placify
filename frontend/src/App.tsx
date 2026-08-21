import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "./components/ui/CustomCursor";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDash from "./pages/AdminDash";
import StudentDash from "./pages/StudentDash";
import PanelistDash from "./pages/PanelistDash";

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
          <Route path="/student" element={<StudentDash />} />
          <Route path="/panelist" element={<PanelistDash />} />

          {/* Sub-views */}
          <Route
            path="/admin/*"
            element={
              <div className="text-text-secondary p-8">
                Sub-view Module Loading...
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;