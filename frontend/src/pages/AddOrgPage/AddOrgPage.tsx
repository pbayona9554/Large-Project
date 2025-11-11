import { useState } from "react";
import styles from "./AddOrgPage.module.css";

export default function AddEditOrgPage() {
  const [orgName, setOrgName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/ucf-knight-placeholder.png");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSave = () => {
    console.log("Saving organization:", { orgName, adminEmail, category, description });
    // handle save logic here
  };

  const handleDelete = () => {
    console.log("Organization deleted");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Organization</h1>

        {/* Image Upload Section */}
        <div className={styles.imageSection}>
          <img src={image} alt="Organization Logo" className={styles.orgImage} />
          <label className={styles.uploadBtn}>
            Upload/Change your image
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        </div>

        {/* Form Fields */}
        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Name of your organization:</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Recreational">Recreational</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Email of the administrator (must be same as used to Login):</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Please, describe your organization:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className={styles.buttonRow}>
            <button type="button" className={styles.saveBtn} onClick={handleSave}>
              Save Changes
            </button>
            <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
