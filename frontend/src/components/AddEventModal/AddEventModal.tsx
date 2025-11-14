// src/components/AddEventModal/AddEventModal.tsx
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./AddEventModal.module.css";

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

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function AddEventModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [logoUrl, setLogoUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [clubId, setClubId] = useState(""); 

  if (!open) return null;

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as Category);
  };

  const handleImageUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    setPreview(url);
  };

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const eventData = {
        title: name,
        description,
        location,
        date,
        category,
        imageUrl: logoUrl,
        // add clubId if you want to pass selected org later
        clubId: "", 
    };

    await onSubmit(eventData);

    // reset form
    setName("");
    setDescription("");
    setLocation("");
    setDate("");
    setCategory(CATEGORIES[0]);
    setLogoUrl("");
    setPreview(null);
    onClose();
    };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* FIXED: × instead of "times" */}
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>Add New Event</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            required
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            required
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            required
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            required
            type="datetime-local"
            placeholder="Date & Time"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select
            required
            value={category}
            onChange={handleCategoryChange}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

        <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            required
        >
            <option value="">Select Organization</option>
            {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>

          <div className={styles.imageSection}>
            {preview && <img src={preview} alt="Preview" className={styles.preview} />}
            <input
              type="url"
              placeholder="Event Image URL (optional)"
              value={logoUrl}
              onChange={handleImageUrl}
            />
          </div>

          <button type="submit" className={styles.submit}>
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
}