// frontend/src/pages/EventCard/EventCard.tsx
import { useState, useEffect } from "react";
import styles from "./EventCard.module.css";
import { useAuth } from "../../context/AuthContext";

type Event = {
  _id?: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  category?: string;
  logo?: string;
  featured?: boolean;
  attendees?: string[]; 
};

type EventCardProps = {
  event: Event;
  onEdit?: () => void;
  onRequestLogin?: () => void;
};

export default function EventCard({ event, onEdit, onRequestLogin }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { user, token } = useAuth();
  const [hasRSVPed, setHasRSVPed] = useState(false);

  const toggle = () => setExpanded((prev) => !prev);
  const close = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded(false);
  };

  // Check if user has RSVP'd
  useEffect(() => {
    if (user && event.attendees) {
      setHasRSVPed(event.attendees.includes(user._id));
    }
  }, [user, event.attendees]);

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  const handleRSVP = async () => {
    if (!user) {
      onRequestLogin?.();
      return;
    }
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    try {
      const url = hasRSVPed
        ? `/api/events/${event._id}/cancel-rsvp`
        : `/api/events/${event._id}/rsvp`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      setHasRSVPed(!hasRSVPed); // toggle local state
      alert(hasRSVPed ? "RSVP canceled" : "Successfully RSVP'd");
    } catch (err: any) {
      console.error("RSVP error:", err);
      alert(`RSVP failed: ${err.message}`);
    }
  };

   return (
    <>
      <article className={`${styles.card} ${expanded ? styles.expanded : ""}`} onClick={toggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && toggle()}>
        {expanded && onEdit && (
          <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Edit event">
            Edit
          </button>
        )}

        {expanded && <button className={styles.closeBtn} onClick={close} aria-label="Close">×</button>}

        <div className={styles.thumb}>
          <img src={event.logo ?? "https://via.placeholder.com/300x180?text=No+Image"} alt={`${event.name} poster`} />
        </div>

        <h3 className={styles.name}>{event.name}</h3>

        {expanded && (
          <div className={styles.expandedContent}>
            {event.description && <p className={styles.detailLine}>{event.description}</p>}
            {event.date && <p className={styles.detailLine}><strong>Date:</strong> {formatDate(event.date)}</p>}
            {event.location && <p className={styles.detailLine}><strong>Location:</strong> {event.location}</p>}
            {event.category && <p className={styles.detailLine}><strong>Category:</strong> {event.category}</p>}
          </div>
        )}

        {expanded && (
          <button className={styles.rsvpBtn} onClick={(e) => { e.stopPropagation(); handleRSVP(); }}>
            {hasRSVPed ? "Cancel RSVP" : "RSVP"}
          </button>
        )}
      </article>

      {expanded && <div className={`${styles.backdrop} ${styles.visible}`} onClick={close} aria-hidden="true" />}
    </>
  );
}
