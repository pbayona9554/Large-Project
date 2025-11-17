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
  onSubmit: (formData: FormData) => void;
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
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        date: initialData.date ? initialData.date.split("T")[0] : "",
        time: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("date", form.date);
    if (form.time) formData.append("time", form.time);
    formData.append("location", form.location);
    formData.append("logo", form.logo);
    formData.append("category", form.category);
    formData.append("featured", String(form.featured));
    onSubmit(formData);
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
            required
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />

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

          {/* CENTERED BUTTONS */}
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "#b71c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#d32f2f")}
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