// frontend/src/components/AddEventModal/AddEventModal.tsx
import { useState, useEffect } from "react";
import styles from "./AddEventModal.module.css";

type Event = {
  _id?: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  category?: string;
  logo?: string;
  featured?: boolean;
};

type AddEventModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;  // ← Now accepts plain object
  initialData?: Event | null;
  onDelete?: () => void;
};

const CATEGORIES = [
  "Academic",
  "Community Service",
  "Religious",
  "Social",
  "Sports & Recreation",
  "Technology",
  "Other",
] as const;

type Category = typeof CATEGORIES[number];

export default function AddEventModal({
  open,
  onClose,
  onSubmit,
  initialData,
  onDelete,
}: AddEventModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    logo: "",
    featured: false,
    category: CATEGORIES[0] as Category,
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const eventDate = initialData.date ? new Date(initialData.date) : null;
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        date: eventDate ? eventDate.toISOString().split("T")[0] : "",
        time: "", // You can extract time if stored separately later
        location: initialData.location || "",
        logo: initialData.logo || "",
        featured: initialData.featured || false,
        category: (initialData.category as Category) || CATEGORIES[0],
      });
      setPreview(initialData.logo || null);
    } else {
      setForm({
        name: "",
        description: "",
        date: "",
        time: "",
        location: "",
        logo: "",
        featured: false,
        category: CATEGORIES[0],
      });
      setPreview(null);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleImageUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm((f) => ({ ...f, logo: url }));
    setPreview(url);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, category: e.target.value as Category }));
  };

  // FIXED: Send clean JSON object instead of FormData
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      time: form.time || undefined,
      location: form.location.trim(),
      category: form.category,
      logo: form.logo || undefined,
      featured: form.featured,
      organization: "University Event", // ← Change later if needed
    };

    onSubmit(eventData);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${initialData?.name}"? This cannot be undone.`)) {
      onDelete?.();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>{initialData ? "Edit" : "Add"} Event</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            required
            placeholder="Event Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <textarea
            placeholder="Description (optional)"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <input
              placeholder="Time (e.g. 7:00 PM)"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>

          <input
 required placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />

          <select required value={form.category} onChange={handleCategoryChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className={styles.imageSection}>
            {preview && <img src={preview} alt="Preview" className={styles.preview} />}
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={form.logo}
              onChange={handleImageUrl}
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.submit}>
              {initialData ? "Update Event" : "Create Event"}
            </button>

            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className={styles.submit}
                style={{
                  background: "#d32f2f",
                  color: "white",
                }}
              >
                Delete Event
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}