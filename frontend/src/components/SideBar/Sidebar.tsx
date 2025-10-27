import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import homeIcon from "../../assets/home.png";
import profileIcon from "../../assets/profile.png";
import eventsIcon from "../../assets/events.png";
import calendarIcon from "../../assets/calendar.png";
import loginIcon from "../../assets/login.png";

type Item = {
  label: string;
  href: string;
  icon: React.ReactNode; // keep it simple
};

const DEFAULT_ITEMS: Item[] = [
  { label: "Home", href: "/", icon: <img src={homeIcon} alt="Home" /> },
  {
    label: "My Dashboard",
    href: "/orgs",
    icon: <img src={profileIcon} alt="Dashboard" />,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <img src={calendarIcon} alt="Calendar" />,
  },
  {
    label: "Events",
    href: "/events",
    icon: <img src={eventsIcon} alt="Events" />,
  },
  {
    label: "Log In",
    href: "/login",
    icon: <img src={loginIcon} alt="Log In" />,
  },
];

export default function Sidebar({ items = DEFAULT_ITEMS }: { items?: Item[] }) {
  const [collapsed, setCollapsed] = useState(false);

  // expose width to the page so main can use margin-left: var(--sidebar-w)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      collapsed ? "72px" : "240px"
    );
  }, [collapsed]);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        {!collapsed && <strong className={styles.brand}>Knight Hub</strong>}
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <span className={styles.chev}>{collapsed ? "▶" : "◀"}</span>
        </button>
      </div>

      <nav className={styles.navContainer}>
        <div className={styles.nav}>
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className={styles.link}
              title={collapsed ? it.label : undefined}
            >
              <span className={styles.icon}>{it.icon}</span>
              <span className={styles.label}>{it.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
