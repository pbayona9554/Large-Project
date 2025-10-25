import { useState } from "react";
import LoginModal from "../../components/LoginModal/LoginModal";
import OrgCard from "../OrgCard/OrgCard";
import styles from "./StudentOrgsPage.module.css";

const MOCK_ORGS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Organization Name",
  logo: "/ucf-knight-placeholder.png", // replace with your asset path
}));

export default function StudentOrgsPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span>Student</span>
            <span>Organizations</span>
          </h1>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>300,000</span> Organizations
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>400,000,000</span> Events
            </div>

            <div className={styles.actions}>
              <button
                className={styles.pillBtn}
                onClick={() => setLoginOpen(true)}
              >
                Add/Edit
              </button>
              <div className={styles.menuWrap}>
                <button className={styles.pillBtn} aria-haspopup="true">
                  Filter ▾
                </button>
                {/* wire your dropdown later */}
              </div>
            </div>
          </div>
        </header>

        <section aria-label="Organizations" className={styles.grid}>
          {MOCK_ORGS.map((org) => (
            <OrgCard key={org.id} name={org.name} logo={org.logo} />
          ))}
        </section>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
