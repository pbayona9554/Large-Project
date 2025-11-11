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
  console.log("StudentOrgsPage rendered");


  return (
    <div>
      <h1>TEST: StudentOrgsPage Loaded</h1>
    </div>
  );



  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Welcome, User!</span>
          </h1>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search for an organization or event..."
            className={styles.searchBar}
          />

        </header>

        <div className={styles.gridContainer}>
          {/* Organizations Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>My Organizations</h2>
            <section aria-label="MyOrganizations" className={styles.grid}>
              {MOCK_ORGS.map((org) => (
                <OrgCard key={org.id} name={org.name} logo={org.logo} />
              ))}
            </section>
          </div>
          
          {/* Events Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>My Events</h2>
            <section aria-label="MyEvents" className={styles.grid}>
              {MOCK_EVENTS.map((ev) => (
                <OrgCard key={ev.id} name={ev.name} logo={ev.logo} />
              ))}
            </section>
          </div>
        </div>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
