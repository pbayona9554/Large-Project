import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./EventsPage.module.css";
import { useAuth } from "../../context/AuthContext";

export default function EventsPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://178.128.188.181:5000/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        console.log("Fetched events response:", data);

        // data.events is expected to be an array
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      event.category?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <main className={styles.page}>
        {!selectedEvent ? (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>
                <span>Upcoming Events</span>
              </h1>

              <div className={styles.statsRow}>
                <input
                  type="text"
                  placeholder="Search events..."
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

            <section aria-label="Events" className={styles.grid}>
              {loading ? (
                <p>Loading events...</p>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <OrgCard
                    key={event._id || event.id}
                    name={event.name}
                    logo={event.logo}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              ) : (
                <p>No events found.</p>
              )}
            </section>
          </>
        ) : (
          <div className={styles.orgDetail}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedEvent(null)}
            >
              ← Back
            </button>
            <h2>{selectedEvent.name}</h2>
            <img
              src={selectedEvent.logo}
              alt={`${selectedEvent.name} logo`}
              className={styles.detailImage}
            />
            <p>{selectedEvent.description}</p>
            {selectedEvent.date && <p><strong>Date:</strong> {selectedEvent.date}</p>}
            {selectedEvent.location && (
              <p><strong>Location:</strong> {selectedEvent.location}</p>
            )}
            {selectedEvent.organization && (
              <p><strong>Hosted by:</strong> {selectedEvent.organization}</p>
            )}
          </div>
        )}
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
