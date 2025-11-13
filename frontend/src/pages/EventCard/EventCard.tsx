// frontend/src/pages/EventCard/EventCard.tsx
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
};

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

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

  // Close with Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <>
      {/* ── CARD (normal or expanded) ── */}
      <article
        className={`${styles.card} ${expanded ? styles.expanded : ""}`}
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggle()}
      >
        {/* Close button */}
        {expanded && (
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            ×
          </button>
        )}

        {/* Thumbnail */}
        <div className={styles.thumb}>
          <img
            src={event.logo ?? "https://via.placeholder.com/300x180?text=No+Image"}
            alt={`${event.name} logo`}
          />
        </div>

        {/* Name */}
        <h3 className={styles.name}>{event.name}</h3>

        {/* Expanded Details */}
        {expanded && (
          <div className={styles.expandedContent}>
            {event.description && (
              <p className={styles.detailLine}>{event.description}</p>
            )}

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
          </div>
        )}
      </article>

      {/* ── BLURRED BACKDROP ── */}
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