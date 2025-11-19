// frontend/src/pages/OrgCard/OrgCard.tsx
import { useState, useEffect } from "react";
import styles from "./OrgCard.module.css";
import { useAuth } from "../../context/AuthContext";

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
  onEdit?: () => void;
};

export default function OrgCard({ org, onEdit }: OrgCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { user, token } = useAuth();

  const toggle = () => setExpanded((prev) => !prev);
  const close = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded(false);
  };

  const handleJoin = async () => {
    try {
      if (!user) return alert("Please log in to join this organization.");
      if (!token) return alert("Authentication error. Please log in again.");

      const orgId = org._id || org.id;
      if (!orgId) return alert("Organization ID missing.");

      const res = await fetch(`/api/orgs/${orgId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to join organization");
      }

      const data = await res.json();
      alert(data.message ?? "Joined organization!");
    } catch (err: any) {
      console.error("Join org error:", err);
      alert(err.message || "Failed to join organization.");
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
        {expanded && onEdit && (
          <button
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        )}

        {expanded && (
          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Close"
          >
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

        {expanded && (
          <button
            className={styles.joinBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleJoin();
            }}
          >
            Join
  </button>
)}
      </article>

      {expanded && (
        <div
          className={`${styles.backdrop} ${styles.visible}`}
          onClick={close}
        />
      )}
    </>
  );
}
