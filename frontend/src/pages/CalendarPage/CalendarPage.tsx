import { useState, useEffect, useMemo } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import styles from "./CalendarPage.module.css";
import { useAuth } from "../../context/AuthContext";

interface Event {
  _id: string;
  name: string;
  date: string; // ISO format: "2025-11-15"
  logo?: string;
  description?: string;
  location?: string;
  organization?: string;
  category?: string;
}

interface DayEvent {
  event: Event;
  isHoliday?: boolean;
}

// === CATEGORY COLORS (Exactly as requested) ===
const categoryColors: Record<string, string> = {
  Academic: "#4A90E2",               // Blue
  "Community Service": "#50C878",    // Green
  Religious: "#B19CD9",              // Purple
  Social: "#FF6B9D",                 // Pink
  "Sports & Recreation": "#FF8C42",  // Orange
  Technology: "#00CED1",             // Cyan
  Other: "#95A5A6",                  // Gray
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<DayEvent[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${BASE_URL}/events`);
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

  // Static U.S. holidays
  const holidays = useMemo(() => {
    const year = currentDate.getFullYear();
    return [
      { date: `${year}-01-01`, name: "New Year's Day" },
      { date: `${year}-07-04`, name: "Independence Day" },
      { date: `${year}-12-25`, name: "Christmas Day" },
    ];
  }, [currentDate]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => {
    const prev = new Date(year, month, 0);
    return prev.getDate() - i;
  }).reverse();

  const totalCells = 42; // 6 rows × 7 days
  const filledCells = days.length + firstDay;
  const nextMonthDays = Array.from(
    { length: totalCells - filledCells },
    (_, i) => i + 1
  );

  // Get events and holidays for a specific date (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string): DayEvent[] => {
    const dayEvents: DayEvent[] = [];

    // Campus events
    events.forEach((evt) => {
      if (evt.date && evt.date.startsWith(dateStr)) {
        dayEvents.push({ event: evt });
      }
    });

    // Holidays
    holidays.forEach((h) => {
      if (h.date === dateStr) {
        dayEvents.push({
          event: { ...h, _id: `holiday-${h.date}`, category: "Holiday" } as any,
          isHoliday: true,
        });
      }
    });

    return dayEvents;
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = getEventsForDate(dateStr);
    setSelectedDayEvents(dayEvents);
    setShowDayModal(true);
  };

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1));

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getEventColor = (category?: string): string => {
    if (!category) return categoryColors.Other;
    return categoryColors[category] || categoryColors.Other;
  };

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Calendar</span>
          </h1>

          <div className={styles.controls}>
            <button className={styles.navBtn} onClick={goToPrevMonth}>
              ←
            </button>
            <h2 className={styles.monthYear}>
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button className={styles.navBtn} onClick={goToNextMonth}>
              →
            </button>
          </div>

          {user?.role === "admin" && (
            <div className={styles.actions}>
              <button
                className={styles.pillBtn}
                onClick={() => setLoginOpen(true)}
              >
                Add Event
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <p className={styles.loading}>Loading calendar...</p>
        ) : (
          <section className={styles.calendarGrid}>
            {/* Weekday Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className={styles.weekday}>
                {day}
              </div>
            ))}

            {/* Previous Month (filler) */}
            {prevMonthDays.map((day, i) => (
              <div key={`prev-${i}`} className={styles.dayFiller}>
                {day}
              </div>
            ))}

            {/* Current Month Days */}
            {days.map((day) => {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDate(dateStr);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  className={`${styles.day} ${isToday(day) ? styles.today : ""} ${
                    hasEvents ? styles.hasEvents : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  {hasEvents && (
                    <div className={styles.eventDots}>
                      {dayEvents.slice(0, 3).map((item, idx) => {
                        const color = item.isHoliday
                          ? "#e11d48"
                          : getEventColor(item.event.category);
                        return (
                          <span
                            key={idx}
                            className={styles.dot}
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className={styles.more}>
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Next Month (filler) */}
            {nextMonthDays.map((day, i) => (
              <div key={`next-${i}`} className={styles.dayFiller}>
                {day}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Day Details Modal */}
      {showDayModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDayModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowDayModal(false)}
            >
              ×
            </button>

            <h3>
              {selectedDayEvents.length > 0
                ? new Date(selectedDayEvents[0].event.date).toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )
                : "No events"}
            </h3>

            {selectedDayEvents.length === 0 ? (
              <p>No events or holidays on this day.</p>
            ) : (
              <div className={styles.dayEventsList}>
                {selectedDayEvents.map((item) => {
                  const color = item.isHoliday
                    ? "#e11d48"
                    : getEventColor(item.event.category);

                  return (
                    <div
                      key={item.event._id}
                      className={`${styles.eventItem} ${
                        item.isHoliday ? styles.holidayItem : ""
                      }`}
                      style={{ borderLeftColor: color }}
                    >
                      {item.isHoliday ? (
                        <span className={styles.holidayLabel}>Holiday</span>
                      ) : (
                        <img
                          src={item.event.logo}
                          alt={item.event.name}
                          className={styles.eventLogo}
                        />
                      )}
                      <div>
                        <strong>{item.event.name}</strong>
                        {item.event.category && (
                          <span
                            className={styles.categoryTag}
                            style={{ backgroundColor: color }}
                          >
                            {item.event.category}
                          </span>
                        )}
                        {item.event.location && (
                          <p className={styles.eventMeta}>
                            Location: {item.event.location}
                          </p>
                        )}
                        {item.event.organization && (
                          <p className={styles.eventMeta}>
                            Hosted by: {item.event.organization}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}