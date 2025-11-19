// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import EventCard from "../EventCard/EventCard";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [myOrgs, setMyOrgs] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) {
      setLoginOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

      const userRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const userData = await userRes.json();

      const joinedOrgIds = (userData.user?.clubsjoined || []).map(String);
      const rsvpEventIds = (userData.user?.rsvps || []).map(String);

      // Fetch orgs
      const orgRes = await fetch(`${BASE_URL}/orgs`);
      const orgData = await orgRes.json();
      const joinedOrgs = (orgData.orgs || []).filter((org: any) =>
        joinedOrgIds.includes(org._id)
      );
      setMyOrgs(joinedOrgs);

      // Fetch events
      const eventRes = await fetch(`${BASE_URL}/events`);
      const eventData = await eventRes.json();
      const allEvents = eventData.events || [];

      const eventsToShow = allEvents.filter((event: any) => {
        const fromMyOrg = event.organization?._id && joinedOrgIds.includes(event.organization._id);
        const iRsvpd = rsvpEventIds.includes(event._id);
        return fromMyOrg || iRsvpd;
      });

      setMyEvents(eventsToShow);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Welcome back,</span>
            <span className={styles.nameHighlight}>
              {" "}{user?.name?.split(" ")[0] || "Knight"}!
            </span>
          </h1>
          <p className={styles.subtitle}>
            Your organizations and upcoming events
          </p>
        </header>

        <div className={styles.gridContainer}>
          {/* MY ORGANIZATIONS */}
          <section>
            <h2 className={styles.sectionTitle}>My Organizations</h2>
            {loading ? (
              <p className={styles.loading}>Loading your clubs...</p>
            ) : myOrgs.length > 0 ? (
              <div className={styles.grid}>
                {myOrgs.map((org) => (
                  <OrgCard key={org._id} org={org} onRequestLogin={() => setLoginOpen(true)} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>You haven't joined any organizations yet.</p>
                <a href="/orgs" className={styles.ctaLink}>
                  Explore Student Organizations
                </a>
              </div>
            )}
          </section>

          {/* MY EVENTS */}
          <section>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            {loading ? (
              <p className={styles.loading}>Loading events...</p>
            ) : myEvents.length > 0 ? (
              <div className={styles.grid}>
                {myEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onRequestLogin={() => setLoginOpen(true)}
                    // No onEdit, no RSVP button — clean view only
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No upcoming events from your organizations.</p>
                <a href="/events" className={styles.ctaLink}>
                  Browse All Events
                </a>
              </div>
            )}
          </section>
        </div>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}