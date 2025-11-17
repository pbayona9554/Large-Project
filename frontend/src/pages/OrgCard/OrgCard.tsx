// frontend/src/pages/OrgCard/OrgCard.tsx
import { useState, useEffect } from "react";
import styles from "./OrgCard.module.css";

type Org = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  featured: boolean;
};

type OrgCardProps = {
  org: Org;
  onEdit?: () => void; // NEW
};

export default function OrgCard({ org, onEdit }: OrgCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded((prev) => !prev);
  const close = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded(false);
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
        {org.featured && !expanded && (
          <span className={styles.featuredBadge}>Featured</span>
        )}

        {expanded && onEdit && (
          <button
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit"
          >
            Edit
          </button>
        )}

        {expanded && (
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            ×
          </button>
        )}

        <div className={styles.thumb}>
          <img
            src={org.logo || "https://via.placeholder.com/300x180?text=No+Image"}
            alt={`${org.name} logo`}
          />
        </div>

        <h3 className={styles.name}>{org.name}</h3>

        {expanded && (
          <div className={styles.expandedContent}>
            <p className={styles.detailLine}>{org.description}</p>
            <p className={styles.detailLine}>
              <strong>Category:</strong> {org.category}
            </p>
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