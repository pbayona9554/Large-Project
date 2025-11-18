// frontend/src/components/OrgModal/OrgModal.tsx  (or AddOrgModal.tsx)
import { useState, useEffect } from "react";
import styles from "./OrgModal.module.css";

type Org = {
  _id?: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  featured?: boolean;
};

type AddOrgModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: Org | null;
  onDelete?: () => void;
};

// YOUR EXACT CATEGORIES
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

export default function AddOrgModal({
  open,
  onClose,
  onSubmit,
  initialData,
  onDelete,
}: AddOrgModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0] as Category, // defaults to "Academic"
    logo: "",
    featured: false,
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        category: (initialData.category as Category) || CATEGORIES[0],
        logo: initialData.logo || "",
        featured: initialData.featured || false,
      });
      setPreview(initialData.logo || null);
    } else {
      setForm({
        name: "",
        description: "",
        category: CATEGORIES[0],
        logo: "",
        featured: false,
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

    const orgData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      logo: form.logo,
      featured: form.featured,
    };

    onSubmit(orgData);
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete "${initialData?.name}"? This cannot be undone.`)) {
      onDelete?.();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>{initialData ? "Edit" : "Add"} Organization</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            required
            placeholder="Organization Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <textarea
            required
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <select required value={form.category} onChange={handleCategoryChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className={styles.imageSection}>
            {preview && <img src={preview} alt="Logo Preview" className={styles.preview} />}
            <input
              type="url"
              placeholder="Logo URL (optional)"
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
              {initialData ? "Update Organization" : "Create Organization"}
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
                Delete Organization
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}