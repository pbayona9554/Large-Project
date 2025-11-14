// Sidebar.tsx
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import homeIcon from "../../assets/home.png";
import profileIcon from "../../assets/profile.png";
import eventsIcon from "../../assets/events.png";
import calendarIcon from "../../assets/calendar.png";
import loginIcon from "../../assets/login.png";
import LoginModal from "../LoginModal/LoginModal";
import { useAuth } from "../../context/AuthContext";

type Item = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
};

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      collapsed ? "72px" : "240px"
    );
  }, [collapsed]);

  const items: Item[] = [
    { label: "Home", href: "/", icon: <img src={homeIcon} alt="Home" /> },
    { label: "My Dashboard", href: "/my-dashboard", icon: <img src={profileIcon} alt="Dashboard" /> },
    { label: "Calendar", href: "/calendar", icon: <img src={calendarIcon} alt="Calendar" /> },
    { label: "Events", href: "/events", icon: <img src={eventsIcon} alt="Events" /> },
    {
      label: user ? "Log Out" : "Log In",
      icon: <img src={loginIcon} alt={user ? "Log Out" : "Log In"} />,
      action: () => {
        if (user) {
          if (window.confirm("Do you want to log out?")) {
            setUser(null); // Logs out
          }
        } else {
          setIsLoginOpen(true); // Opens login modal
        }
      },
    },
  ];

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.header}>
          {!collapsed && <strong className={styles.brand}>Knight Hub</strong>}
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <span className={styles.chev}>{collapsed ? "▶" : "◀"}</span>
          </button>
        </div>

        <nav className={styles.navContainer}>
          <div className={styles.nav}>
            {items.map((it) => {
              const content = (
                <>
                  <span className={styles.icon}>{it.icon}</span>
                  <span className={styles.label}>{it.label}</span>
                </>
              );

              return it.action ? (
                <button
                  key={it.label}
                  type="button"
                  className={styles.link}
                  onClick={it.action}
                  title={collapsed ? it.label : undefined}
                >
                  {content}
                </button>
              ) : (
                <a
                  key={it.label}
                  href={it.href}
                  className={styles.link}
                  title={collapsed ? it.label : undefined}
                >
                  {content}
                </a>
              );
            })}
          </div>
        </nav>
      </aside>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}