import { useState, useEffect } from "react";
import styles from "./EventCard.module.css";

type Event = {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  date?: string;
  location?: string;
  orgName?: string;
  category?: string;
  createdAt?: string;
  featured?: boolean;
  attendees?: string[];
};

type EventCardProps = {
  event: Event;
  currentUserId?: string;
};

export default function EventCard({ event }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Optional: if your backend includes attendees, check if user already RSVP'd
    const userId = localStorage.getItem("userId");
    if (userId && event.attendees?.includes(userId)) {
      setRsvpStatus(true);
    }
  }, [event]);

  const toggle = () => setExpanded((prev) => !prev);
  const close = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded(false);
  };

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const handleRSVP = async () => {
    if (!token) {
        alert("You must be logged in to RSVP.");
        return;
    }

    try {
        setLoading(true);

        const endpoint = rsvpStatus
          ? `/api/events/${encodeURIComponent(event.name)}/cancel-rsvp`
          : `/api/events/${encodeURIComponent(event.name)}/rsvp`;

        const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        });

        // Try parsing JSON, fallback to text
        let data: any;
        try {
        data = await res.json();
        } catch {
        const text = await res.text();
        data = { message: text || "No response from server" };
        }

        if (!res.ok) throw new Error(data.error || data.message || "Something went wrong");

        setRsvpStatus((prev) => !prev);
        alert(data.message || (rsvpStatus ? "RSVP canceled" : "RSVP successful"));
    } catch (err: any) {
        console.error("RSVP error:", err);
        alert(err.message || "RSVP failed. Please try again.");
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <>
      <article
        className={`${styles.card} ${expanded ? styles.expanded : ""}`}
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggle()}
      >
        {expanded && (
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            ×
          </button>
        )}

        <div className={styles.thumb}>
          <img
            src={event.logo ?? "https://via.placeholder.com/300x180?text=No+Image"}
            alt={`${event.name} logo`}
          />
        </div>

        <h3 className={styles.name}>{event.name}</h3>

        {expanded && (
          <div className={styles.expandedContent}>
            {event.description && <p className={styles.detailLine}>{event.description}</p>}
            {event.date && (
              <p className={styles.detailLine}>
                <strong>Date:</strong> {formatDate(event.date)}
              </p>
            )}
            {event.location && (
              <p className={styles.detailLine}>
                <strong>Location:</strong> {event.location}
              </p>
            )}
            {event.category && (
              <p className={styles.detailLine}>
                <strong>Category:</strong> {event.category}
              </p>
            )}

            {/* ✅ RSVP Toggle Button */}
            <button
              className={`${styles.rsvpBtn} ${rsvpStatus ? styles.rsvpDone : ""}`}
              onClick={handleRSVP}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : rsvpStatus
                ? "Cancel RSVP"
                : "RSVP"}
            </button>
          </div>
        )}
      </article>

      {expanded && (
        <div
          className={`${styles.backdrop} ${styles.visible}`}
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}