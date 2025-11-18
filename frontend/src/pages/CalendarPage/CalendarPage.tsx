// frontend/src/pages/CalendarPage/CalendarPage.tsx
import { useState, useEffect, useMemo } from "react";
import styles from "./CalendarPage.module.css";
import { useAuth } from "../../context/AuthContext"; // <-- Added

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

type Event = {
  _id: string;
  name: string;
  date?: string;
  time?: string;
  location?: string;
  category?: string;
};

const CATEGORY_OPTIONS = [
  "All",
  "Academic",
  "Community Service",
  "Religious",
  "Social",
  "Sports & Recreation",
  "Technology",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Academic: "academic",
  "Community Service": "community",
  Religious: "religious",
  Social: "social",
  "Sports & Recreation": "sports",
  Technology: "technology",
  Other: "other",
};

const CATEGORY_HEX_COLORS: Record<string, string> = {
  Academic: "#4A90E2",
  "Community Service": "#50C878",
  Religious: "#B19CD9",
  Social: "#FF6B9D",
  "Sports & Recreation": "#FF8C42",
  Technology: "#00CED1",
  Other: "#95A5A6",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const { user } = useAuth(); // <-- Added

  // Optional: If you want to trigger login from calendar page
  const onRequestLogin = () => {
    // This could be passed down or handled via context
    // For now, just alert or redirect
    alert("Please log in to RSVP.");
    // Or: window.location.href = "/login";
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
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

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    filteredEvents.forEach((event) => {
      if (event.date) {
        const dateKey = format(new Date(event.date), "yyyy-MM-dd");
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(event);
      }
    });
    return map;
  }, [filteredEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const paddingBefore = Array(firstDayOfWeek).fill(null);
  const lastDayOfWeek = monthEnd.getDay();
  const paddingAfter = Array(6 - lastDayOfWeek).fill(null);

  const calendarDays = [...paddingBefore, ...monthDays, ...paddingAfter];

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    const key = format(day, "yyyy-MM-dd");
    return eventsByDate.get(key) || [];
  };

  const currentMonthEvents = useMemo(() => {
    return filteredEvents
      .filter((event) => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return (
          eventDate.getMonth() === currentMonth.getMonth() &&
          eventDate.getFullYear() === currentMonth.getFullYear()
        );
      })
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  }, [filteredEvents, currentMonth]);

  // RSVP Handler — EXACT SAME LOGIC AS EventCard.tsx
  const handleRSVP = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      onRequestLogin();
      return;
    }

    if (user.role === "admin") {
      alert("Admins cannot RSVP to events.");
      return;
    }

    try {
      const res = await fetch(
        `/api/events/${encodeURIComponent(event.name)}/rsvp`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(await res.text() || "Failed to RSVP");

      alert("Successfully RSVP'd to the event!");
      // Optionally refetch events or update UI
    } catch (err: any) {
      alert(`RSVP failed: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>Calendar</span>
        </h1>

        <nav className={styles.nav}>
          <button
            className={styles.navBtn}
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            aria-label="Previous month"
          >
            <span className={styles.arrowIcon}>←</span>
          </button>
          <div className={styles.currentMonth}>
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button
            className={styles.navBtn}
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Next month"
          >
            <span className={styles.arrowIcon}>→</span>
          </button>
        </nav>

        <div className={styles.filterSection}>
          <div className={styles.filterWrapper}>
            <button
              className={styles.filterBtn}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filter by Category
              {selectedCategory !== "All" && (
                <>
                  {" · "}
                  <span
                    className={styles.filterDot}
                    style={{ backgroundColor: CATEGORY_HEX_COLORS[selectedCategory] }}
                  />
                  {selectedCategory}
                </>
              )}
            </button>

            {filterOpen && (
              <div className={styles.dropdown}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const colorClass = cat === "All" ? "" : CATEGORY_COLORS[cat] || "other";
                  return (
                    <div
                      key={cat}
                      className={`${styles.dropdownItem} ${
                        selectedCategory === cat ? styles.active : ""
                      }`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setFilterOpen(false);
                      }}
                    >
                      {cat !== "All" && (
                        <span className={`${styles.categoryDot} ${styles[colorClass]}`} />
                      )}
                      <span>{cat}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={styles.calendar} aria-label="Event Calendar">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem" }}>
            Loading calendar events...
          </p>
        ) : (
          <>
            <div className={styles.weekdays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className={styles.days}>
              {calendarDays.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isCurrentMonth = day ? isSameMonth(day, currentMonth) : false;

                return (
                  <div
                    key={day ? day.toISOString() : `empty-${idx}`}
                    className={`${styles.day} ${
                      !isCurrentMonth ? styles.otherMonth : ""
                    } ${day && isToday(day) ? styles.today : ""}`}
                  >
                    {day && <div className={styles.dayNumber}>{format(day, "d")}</div>}

                    <div className={styles.eventsList}>
                      {dayEvents.slice(0, 5).map((event) => {
                        const colorClass =
                          CATEGORY_COLORS[event.category || "Other"] || "other";

                        return (
                          <div
                            key={event._id}
                            className={styles.eventItem}
                            title={event.name}
                          >
                            <span
                              className={`${styles.eventDot} ${styles[colorClass]}`}
                            />
                            {event.name}
                          </div>
                        );
                      })}
                      {dayEvents.length > 5 && (
                        <div
                          className={styles.eventItem}
                          style={{ fontStyle: "italic", color: "var(--muted)" }}
                        >
                          +{dayEvents.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* UPCOMING EVENTS LIST — SCROLLABLE AFTER 4 ITEMS */}
      <section className={styles.upcomingEventsSection}>
        <h2 className={styles.upcomingTitle}>
          Upcoming Events in {format(currentMonth, "MMMM yyyy")}
        </h2>

        <div className={styles.upcomingList}>
          {currentMonthEvents.length > 0 ? (
            currentMonthEvents.map((event) => {
              const categoryClass = CATEGORY_COLORS[event.category || "Other"] || "other";
              const eventDate = event.date ? new Date(event.date) : null;

              return (
                <div
                  key={event._id}
                  className={`${styles.upcomingEvent} ${styles[categoryClass]}`}
                >
                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <p className={styles.eventDetails}>
                      {eventDate
                        ? format(eventDate, "EEEE, MMMM d, yyyy")
                        : "No date"}
                      {event.time ? ` · ${event.time}` : ""}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <button
                    className={styles.rsvpButton}
                    onClick={(e) => handleRSVP(event, e)}
                  >
                    RSVP
                  </button>
                </div>
              );
            })
          ) : (
            <p className={styles.noEvents}>
              No events scheduled for this month.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}