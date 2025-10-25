import { useState } from "react";
import Modal from "../Modal/Modal";
import styles from "./LoginModal.module.css";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // plug in your auth call here
    alert(`Signed in as ${email}`);
    onClose();
  }

  return (
    <Modal isOpen={open} onClose={onClose} labelledBy="loginTitle">
      <div className={styles.card}>
        <div className={styles.inner}>
          <h1 id="loginTitle" className={styles.title}>Login</h1>

          <form onSubmit={onSubmit}>
            <label className={styles.srOnly} htmlFor="email">UCF Email</label>
            <div className={styles.field}>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="UCF Email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className={styles.srOnly} htmlFor="password">Password</label>
            <div className={styles.field}>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.btn} type="submit">
                <span>Sign In</span>
                <svg className={styles.lock} viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" fill="none" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" fill="none" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <p className={styles.meta}>
              Don’t have an account? <a href="#">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}
