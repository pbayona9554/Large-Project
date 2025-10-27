import Sidebar from "./components/SideBar/Sidebar";
import StudentOrgsPage from "./pages/StudentOrgsPage/StudentOrgsPage";

export default function App() {
  return (
    <>
      <Sidebar />
      <main style={{ marginLeft: "var(--sidebar-w)", minHeight: "100vh" }}>
        <StudentOrgsPage />
      </main>
    </>
  );
}
