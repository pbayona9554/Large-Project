import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SideBar/Sidebar";
import StudentOrgsPage from "./pages/StudentOrgsPage/StudentOrgsPage";
import EventsPage from "./pages/EventsPage/EventsPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import AddOrgPage from "./pages/AddOrgPage/AddOrgPage";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar />
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <main
            style={{
              marginLeft: "var(--sidebar-w)",
              flex: 1,
              transition: "margin-left 0.2s",
            }}
          >
          <Routes>
            <Route path="/" element={<StudentOrgsPage />} />
            <Route path="/orgs" element={<StudentOrgsPage />} />
            <Route path="/events" element={<EventsPage />} />  
            <Route path="/my-dashboard" element={<Dashboard />} />  
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/add-org" element={<AddOrgPage />} />
          </Routes>

          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}