import { useState, useEffect } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../context/AuthContext";

interface Org {
  _id: string;
  name: string;
  logo: string;
}

interface Event {
  _id: string;
  name: string;
  logo: string;
  organization?: string;
}

export default function Dashboard() {
  const { user, token } = useAuth(); // this gives us the logged-in user + token from context
  const [loginOpen, setLoginOpen] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDashboardData = async () => {
    if (!token) {
      setLoginOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch current user
      const userRes = await fetch("http://178.128.188.181:5000/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("auth/me response status:", userRes.status);

      const userData = await userRes.json(); // parse JSON once
      console.log("auth/me response data:", userData);

      if (!userRes.ok) throw new Error(userData.error || "Failed to fetch user");

      const userOrgs = userData.user?.clubsjoined || [];

      // Fetch all orgs
      const orgsRes = await fetch("http://178.128.188.181:5000/api/orgs");
      const allOrgs = await orgsRes.json();
      const myOrgs =
        allOrgs.orgs?.filter((org: Org) => userOrgs.includes(org.name)) || [];
      setOrgs(myOrgs);

      // Fetch all events
      const eventsRes = await fetch("http://178.128.188.181:5000/api/events");
      const allEvents = await eventsRes.json();
      const myEvents =
        allEvents.events?.filter((ev: Event) =>
          userOrgs.includes(ev.organization || "")
        ) || [];
      setEvents(myEvents);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [token]);

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Welcome, {user?.name || "User"}!</span>
          </h1>

          <input
            type="text"
            placeholder="Search for an organization or event..."
            className={styles.searchBar}
          />
        </header>

        <div className={styles.gridContainer}>
          {/* Organizations Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>My Organizations</h2>
            <section aria-label="MyOrganizations" className={styles.grid}>
              {loading ? (
                <p>Loading organizations...</p>
              ) : orgs.length ? (
                orgs.map((org) => (
                  <OrgCard key={org._id} name={org.name} logo={org.logo} />
                ))
              ) : (
                <p>You are not a member of any organizations yet.</p>
              )}
            </section>
          </div>

          {/* Events Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>My Events</h2>
            <section aria-label="MyEvents" className={styles.grid}>
              {loading ? (
                <p>Loading events...</p>
              ) : events.length ? (
                events.map((ev) => (
                  <OrgCard key={ev._id} name={ev.name} logo={ev.logo} />
                ))
              ) : (
                <p>No upcoming events for your organizations.</p>
              )}
            </section>
          </div>
        </div>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}