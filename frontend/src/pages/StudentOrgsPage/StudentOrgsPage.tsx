import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgModal from "../../components/OrgModal/OrgModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./StudentOrgsPage.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentOrgsPage() {
  console.log("StudentOrgsPage rendered");
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [userOrgs, setUserOrgs] = useState<string[]>([]);
  
  console.log("Logged in user:", user); //  logs inside React component

  useEffect(() => {
    if (!token) return;
    const fetchOrgs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/orgs`);
        if (!res.ok) throw new Error("Failed to fetch organizations");
        const data = await res.json();
        console.log("Fetched orgs response:", data);

        // data.orgs is the array; fallback to [] if undefined
        setOrgs(
          Array.isArray(data.organizations)
            ? data.organizations
            : Array.isArray(data.orgs)
            ? data.orgs
            : []
        );
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setOrgs([]);
      } finally {
        setLoading(false); // stop loading when fetch completes
      }
    };

    fetchOrgs();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/orgs/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        console.log("Fetched categories:", data);

        setCategories(["All", ...(data.categories || [])]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch user's joined orgs
  useEffect(() => {
    if (!token) return;
    const fetchUserOrgs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUserOrgs(data.user?.clubsjoined || []);
      } catch (err) {
        console.error("Error fetching user orgs:", err);
      }
    };
    fetchUserOrgs();
  }, [token]);

  // Join / Leave organization
  const handleOrgMembershipToggle = async () => {
    if (!selectedOrg || !token) return;
    const isMember = userOrgs.includes(selectedOrg.name);
    const url = `${BASE_URL}/orgs/${encodeURIComponent(selectedOrg.name)}/${isMember ? "leave" : "join"}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Failed to ${isMember ? "leave" : "join"} organization`);
        return;
      }

      // Refresh user's orgs
      const updatedRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setUserOrgs(updatedData.user?.clubsjoined || []);

      // Close modal
      setOrgModalOpen(false);
      setSelectedOrg(null);
    } catch (err) {
      console.error(`${isMember ? "Leave" : "Join"} org error:`, err);
    }
  };

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
                      onClick={() => navigate("/add-org")}
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
                        {categories.map((filter) => (
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
                        ))}
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
                    onClick={() => {
                      setSelectedOrg(org);
                      setOrgModalOpen(true);
                    }}
                  />
                ))
              ) : (
                <p>No organizations found.</p>
              )}
            </section>
          </>
      </main>

      {/* Org Modal STAYS OVERLAYED ON TOP OF THE PAGE */}
    <OrgModal
      isOpen={orgModalOpen}
      onClose={() => {
        setOrgModalOpen(false);
        setSelectedOrg(null);
      }}
      orgName={selectedOrg?.name || ""}
      description={selectedOrg?.description || ""}
      onJoin={handleOrgMembershipToggle}
      userOrgs={userOrgs}
    />

    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}