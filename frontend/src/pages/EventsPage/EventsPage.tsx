import { useEffect, useState } from "react";
import AddEventModal from "../../components/AddEventModal/AddEventModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./EventsPage.module.css";
import { useAuth } from "../../context/AuthContext";
import EventCard from "../EventCard/EventCard";

export default function EventsPage() {
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/events`);
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        console.log("Fetched events response:", data);

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

useEffect(() => {
  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/orgs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClubs(Array.isArray(data.orgs) ? data.orgs : []);
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    }
  };

  fetchClubs();
}, []);

const handleAddEvent = async (form: FormData) => {
  try {
    const token = localStorage.getItem("token");

    const eventData = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      date: form.get("date") as string,
      location: form.get("location") as string,
      category: form.get("category") as string,
      organization: "N/A", // or pick from clubs if you add a select
      logo: form.get("logo") as string || "/ucf-knight-placeholder.png",
    };

    console.log("Submitting event:", eventData);

    const res = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create event");
    }

    const data = await res.json();
    console.log("Event created:", data);
    alert("Event created successfully!");

    // Refresh events
    const refreshed = await fetch(`${BASE_URL}/events`);
    const refreshedData = await refreshed.json();
    setEvents(Array.isArray(refreshedData.events) ? refreshedData.events : []);
    setAddEventOpen(false);
  } catch (error) {
    console.error("Error creating event:", error);
    alert(error instanceof Error ? error.message : "Failed to create event");
  }
};


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
                  onClick={() => setAddEventOpen(true)}
                >
                  Add Event
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
                    {["All", "Academic", "Sports", "Cultural"].map((filter) => (
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

        <section aria-label="Events" className={styles.grid}>
          {loading ? (
            <p>Loading events...</p>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))
          ) : (
            <p>No events found.</p>
          )}
        </section>
      </main>

      <AddEventModal
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        onSubmit={handleAddEvent}
        clubs={clubs}
      />
    </>
  );
}
