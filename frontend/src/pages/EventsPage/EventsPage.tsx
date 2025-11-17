// frontend/src/pages/EventsPage/EventsPage.tsx
import { useEffect, useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import EventCard from "../EventCard/EventCard";
import AddEventModal from "../../components/AddEventModal/AddEventModal";
import styles from "./EventsPage.module.css";
import { useAuth } from "../../context/AuthContext";

export default function EventsPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const [events, setEvents] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // MODAL STATE
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    try {
      /////// HERE //////
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ADD OR EDIT HANDLER
  const handleSaveEvent = async (formData: FormData) => {
    try {
      const id = editingEvent?._id;
      const method = id ? "PUT" : "POST";
      /////// HERE //////
      const url = id ? `/api/events/${id}` : "/api/events";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} – ${txt}`);
      }

      await fetchEvents();
      setAddModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error("Failed to save event:", err);
      alert("Could not save event. Check console.");
    }
  };

  // DELETE HANDLER
  const handleDeleteEvent = async (eventId: string) => {
    try {
      /////// HERE //////
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to delete");
      }

      await fetchEvents();
      setAddModalOpen(false);
      setEditingEvent(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete event.");
    }
  };

  // OPEN EDIT MODAL
  const openEdit = (event: any) => {
    setEditingEvent(event);
    setAddModalOpen(true);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      event.category?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
            <span>Events</span>
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
                  className={styles.addBtn}
                  onClick={() => {
                    setEditingEvent(null);
                    setAddModalOpen(true);
                  }}
                >
                  Add Event
                </button>
              )}

              <div className={styles.menuWrap}>
                <button
                  className={styles.pillBtn}
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  Filter
                </button>

                {filterOpen && (
                  <div className={styles.dropdown}>
                    {["All", "Academic", "Sports", "Cultural"].map((f) => (
                      <button
                        key={f}
                        className={`${styles.dropdownItem} ${
                          activeFilter === f ? styles.active : ""
                        }`}
                        onClick={() => {
                          setActiveFilter(f);
                          setFilterOpen(false);
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section aria-label="Events" className={styles.grid}>
          {loading ? (
            <p>Loading events…</p>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={user?.role === "admin" ? () => openEdit(event) : undefined}
                onRequestLogin={() => setLoginOpen(true)}
              />
            ))
          ) : (
            <p>No events found.</p>
          )}
        </section>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <AddEventModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSaveEvent}
        initialData={editingEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent._id) : undefined}
      />
    </>
  );
}