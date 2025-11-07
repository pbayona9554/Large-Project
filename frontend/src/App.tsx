import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SideBar/Sidebar";
import StudentOrgsPage from "./pages/StudentOrgsPage/StudentOrgsPage";
import EventsPage from "./pages/EventsPage/EventsPage";
import Dashboard from "./pages/Dashboard/Dashboard";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar />
        <main style={{ marginLeft: "var(--sidebar-w)", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<StudentOrgsPage />} />
            <Route path="/orgs" element={<StudentOrgsPage />} />
            <Route path="/events" element={<EventsPage />} />  
            <Route path="/my-dashboard" element={<Dashboard />} />  
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}