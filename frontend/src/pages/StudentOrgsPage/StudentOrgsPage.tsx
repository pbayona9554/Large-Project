import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./StudentOrgsPage.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentOrgsPage() {
  console.log("StudentOrgsPage rendered");
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth(); // get logged-in user
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  
  console.log("Logged in user:", user); //  logs inside React component

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch("http://178.128.188.181:5000/api/orgs");
        if (!res.ok) throw new Error("Failed to fetch organizations");

        const data = await res.json();
        console.log("Fetched orgs response:", data);

        // data.orgs is the array; fallback to [] if undefined
        setOrgs(Array.isArray(data.orgs) ? data.orgs : []);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setOrgs([]);
      } finally {
        setLoading(false); // stop loading when fetch completes
      }
    };

    fetchOrgs();
  }, []);

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name && org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || org.category?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <main className={styles.page}>
        {!selectedOrg ? (
          <>
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
                  {user?.role === "admin" && (
                    <button
                      className={styles.pillBtn}
                      onClick={() => setLoginOpen(true)}
                    >
                      Add/Edit
                    </button>
                  )}

                  <div className={styles.menuWrap}>
                    <button
                      className={styles.pillBtn}
                      onClick={() => setFilterOpen(!filterOpen)}
                    >
                      Filter ▾
                    </button>
                    {filterOpen && (
                      <div className={styles.dropdown}>
                        {["All", "Academic", "Sports", "Cultural"].map(
                          (filter) => (
                            <button
                              key={filter}
                              className={`${styles.dropdownItem} ${
                                activeFilter === filter ? styles.active : ""
                              }`}
                              onClick={() => {
                                setActiveFilter(filter);
                                setFilterOpen(false);
                              }}
                            >
                              {filter}
                            </button>
                          )
                        )}
                      </div>
                    )}
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
                    key={org._id || org.id}
                    name={org.name}
                    logo={org.logo}
                    onClick={() => setSelectedOrg(org)}
                  />
                ))
              ) : (
                <p>No organizations found.</p>
              )}
            </section>
          </>
        ) : (
          <div className={styles.orgDetail}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedOrg(null)}
            >
              ← Back
            </button>
            <h2>{selectedOrg.name}</h2>
            <img src={selectedOrg.logo} alt={`${selectedOrg.name} logo`} />
            <p>{selectedOrg.description}</p>
          </div>
        )}
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}