// frontend/src/pages/StudentOrgsPage/StudentOrgsPage.tsx
import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import AddOrgModal from "../../components/OrgModal/OrgModal";
import styles from "./StudentOrgsPage.module.css";
import { useAuth } from "../../context/AuthContext";

type Org = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  featured: boolean;
};

export default function StudentOrgsPage() {
  console.log("StudentOrgsPage rendered");
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Org | null>(null);

  console.log("Token:", token);

  // FETCH ORGS
  const fetchOrgs = async () => {
    try {
      /////// HERE //////
      const res = await fetch("/api/orgs");
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();

      const list = Array.isArray(data.organizations)
        ? data.organizations
        : Array.isArray(data.orgs)
        ? data.orgs
        : [];

      setOrgs(list);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        /////// HERE //////
        const res = await fetch("/api/orgs/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(["All", ...(data.categories || [])]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      org.category.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSaveOrg = async (orgData: any) => {
    try {
      if (!token) {
        alert("You must be logged in to create or edit an organization.");
        return;
      }

      const id = editingOrg?._id || editingOrg?.id;
      const method = id ? "PUT" : "POST";
      // Use the new route for PUT by ID
      const url = id ? `/api/orgs/id/${id}` : "/api/orgs";

      console.log(`${method}ing org:`, id, orgData);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orgData),
      });

      // iline notification + close modal even if backend returns 404
      setNotification({ message: id ? "Organization updated!" : "Organization added!", type: "success" });
      setAddModalOpen(false);
      setEditingOrg(null);
      await fetchOrgs();

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} – ${txt}`);
      }

      await fetchOrgs();
      setAddModalOpen(false);
      setEditingOrg(null);
      
    } catch (err: any) {
      console.error("Failed to save org:", err);
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    try {
      /////// HERE //////
      const res = await fetch(`/api/orgs/${orgId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete organization");

      await fetchOrgs();
      setAddModalOpen(false);
      setEditingOrg(null);
    } catch (err) {
      console.error("Delete org failed:", err);
      alert("Could not delete organization.");
    }
  };

  const openEdit = (org: Org) => {
    setEditingOrg(org);
    setAddModalOpen(true);
  };

  return (
    <>
      <main className={styles.page}>
        {!user && (
          <button className={styles.loginBtn} onClick={() => setLoginOpen(true)}>
            Log In
          </button>
        )}

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
                  className={styles.addBtn}
                  onClick={() => {
                    setEditingOrg(null);
                    setAddModalOpen(true);
                  }}
                >
                  Add Org
                </button>
              )}

              <div className={styles.menuWrap}>
                <button
                  className={styles.pillBtn}
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  Filter
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

        {/* notification */}
        {notification && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}

        <section aria-label="Organizations" className={styles.grid}>
          {loading ? (
            <p>Loading organizations...</p>
          ) : filteredOrgs.length > 0 ? (
            filteredOrgs.map((org) => (
              <OrgCard
                key={org._id || org.id}
                org={org}
                onEdit={user?.role === "admin" ? () => openEdit(org) : undefined}
              />
            ))
          ) : (
            <p>No organizations found.</p>
          )}
        </section>
      </main>

      <AddOrgModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingOrg(null);
        }}
        onSubmit={handleSaveOrg}
        initialData={editingOrg}
        onDelete={editingOrg?._id ? () => handleDeleteOrg(editingOrg._id!) : undefined}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}