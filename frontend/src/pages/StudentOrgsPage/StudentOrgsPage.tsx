import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./StudentOrgsPage.module.css";
import { useAuth } from "../../context/AuthContext";

export default function StudentOrgsPage() {
  console.log("StudentOrgsPage rendered");
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth(); // <-- get logged-in user
  const [orgs, setOrgs] = useState([]);
  console.log("Logged in user:", user); //  logs inside React component


  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch("http://178.128.188.181:5000/api/orgs");
        if (!res.ok) throw new Error("Failed to fetch organizations");
        const data = await res.json();
        setOrgs(data.data || []); // <-- get the array from the response
      } catch (err) {
        console.error("Error fetching organizations:", err);
      } finally {
      setLoading(false);
    }
    };

    fetchOrgs();
  }, []);

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Student Organizations</span>
          </h1>

          <div className={styles.statsRow}>
            <input
              type="text"
              placeholder="Search organizations..."
              className={styles.searchBar}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.actions}>
              {/* Only show Add/Edit button for admins */}
              {user?.role === "admin" && (
                <button
                  className={styles.pillBtn}
                  onClick={() => setLoginOpen(true)}
                >
                  Add/Edit
                </button>
              )}

              <div className={styles.menuWrap}>
                <button className={styles.pillBtn} aria-haspopup="true">
                  Filter ▾
                </button>
                {/* wire your dropdown later */}
              </div>
            </div>
          </div>
        </header>
      <section aria-label="Organizations" className={styles.grid}>
        {loading ? (
          <p>Loading organizations...</p>
        ) : filteredOrgs.length > 0 ? (
          filteredOrgs.map((org) => (
            <OrgCard
              key={org.id}
              name={org.name}
              logo={org.logo || "/ucf-knight-placeholder.png"} // fallback if logo is missing
            />
          ))
        ) : (
          <p>No organizations found.</p>
        )}
      </section>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

