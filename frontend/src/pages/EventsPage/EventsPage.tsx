import { useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./EventsPage.module.css";

import searchIcon from "../../assets/events.png"; // for magnifying glcass

const MOCK_EVENTS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Event Name",
  logo: "/ucf-knight-placeholder.png",
}));

export default function EventsPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Upcoming Events</span>
          </h1>

          <div className={styles.searchRow}>
            {/* search bar – same visual style as the old statBox */}
            <div className={styles.searchBox}>
              <img src={searchIcon} alt="Search" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* keep the Add/Edit button */}
            <div className={styles.actions}>
              <button
                className={styles.pillBtn}
                onClick={() => setLoginOpen(true)}
              >
                Add/Edit
              </button>
            </div>
          </div>
        </header>

        {/* grid of event “cards” – reuse OrgCard for now. Need to make componenet for this  */}
        <section aria-label="Events" className={styles.grid}>
          {MOCK_EVENTS.map((ev) => (
            <OrgCard key={ev.id} name={ev.name} logo={ev.logo} />
          ))}
        </section>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}