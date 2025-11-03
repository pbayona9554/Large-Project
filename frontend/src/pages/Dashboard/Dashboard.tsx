import { useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./Dashboard.module.css";

const MOCK_ORGS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "Organization Name",
  logo: "/ucf-knight-placeholder.png", // replace with your asset path
}));


const MOCK_EVENTS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "Event Name",
  logo: "/ucf-knight-placeholder.png", // replace with your asset path
}));


export default function UserPage() {
  const [loginOpen, setLoginOpen] = useState(false);


  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>My Dashboard</span>
          </h1>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search for an organization or event..."
            className={styles.searchBar}
          />

          {/* Organizations & Events Headers */}
          <h3 className={styles.title}>
            <span> Organizations I'm part of: </span>
            <span> Events to look for: </span>
          </h3>

        </header>

        <section aria-label="MyOrganizations" className={styles.grid}>
          {MOCK_ORGS.map((org) => (
            <OrgCard key={org.id} name={org.name} logo={org.logo} />
          ))}
        </section>

        <section aria-label="MyEvents" className={styles.grid}>
          {MOCK_EVENTS.map((ev) => (
            <OrgCard key={ev.id} name={ev.name} logo={ev.logo} />
          ))}
        </section>

      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
