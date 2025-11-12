import { useState } from "react";
import Modal from "../Modal/Modal";
import styles from "./LoginModal.module.css";
import keyhole from "../../assets/keyhole.svg";
import { useAuth } from "../../context/AuthContext";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

type Role = "member" | "officer";

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { setUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [animating, setAnimating] = useState(false);

  // login fields
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  // signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [role, setRole] = useState<Role>("member");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (isSignup) {
        if (!signupEmail.endsWith("@ucf.edu")) {
          alert("Please use your @ucf.edu email address");
          return;
        }

        const payload = {
          name: `${firstName} ${lastName}`,
          email: signupEmail,
          password: signupPwd,
          role: role === "officer" ? "admin" : "student",
        };

        console.log("Sending signup payload:", payload);

        const res = await fetch("http://178.128.188.181:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Signup response:", data);

        if (!res.ok) {
          alert(`Signup failed: ${data.message || "Unknown error"}`);
          return;
        }

        alert("Signup successful!");
        setIsSignup(false);
        setFirstName("");
        setLastName("");
        setSignupEmail("");
        setSignupPwd("");
        setRole("member");
      } else {
        const payload = { email, password: pwd };

        console.log("Sending login payload:", payload);

        const res = await fetch("http://178.128.188.181:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Login response:", data);

        if (!res.ok) {
          alert(`Login failed: ${data.message || "Unknown error"}`);
          return;
        }

        setUser(
          {
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          },
          data.token // pass token to context
        );

        console.log("User set in context:", {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        console.log("Token in context:", data.token);
        console.log("Token in localStorage:", localStorage.getItem("token"));
        console.log("User in localStorage:", localStorage.getItem("user"));

        alert("Login successful!");
        onClose();
      }
    } catch (err) {
      console.error("Error during auth:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  function toggleMode() {
    setIsSignup(!isSignup);
    setEmail("");
    setPwd("");
    setFirstName("");
    setLastName("");
    setSignupEmail("");
    setSignupPwd("");
    setRole("member");
  }

  return (
    <Modal isOpen={open} onClose={onClose} labelledBy="authTitle">
      <div className={styles.card}>
        <div className={styles.inner}>
          <h1 id="authTitle" className={styles.title}>
            {isSignup ? "Sign Up" : "Login"}
          </h1>

          <form onSubmit={handleSubmit}>
            {isSignup ? (
              <>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.srOnly} htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      className={styles.input}
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.srOnly} htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      className={styles.input}
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.srOnly} htmlFor="signupEmail">
                    UCF Email
                  </label>
                  <input
                    id="signupEmail"
                    className={styles.input}
                    type="email"
                    placeholder="UCF Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.srOnly} htmlFor="signupPwd">
                    Password
                  </label>
                  <input
                    id="signupPwd"
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={signupPwd}
                    onChange={(e) => setSignupPwd(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.srOnly} htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className={`${styles.input} ${styles.select}`}
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    required
                    aria-label="Select role"
                  >
                    <option value="member">Member (Student)</option>
                    <option value="officer">Officer (Administrator)</option>
                  </select>
                  <p className={styles.helpText}>
                    Officers can manage org content. Members have regular access.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <label className={styles.srOnly} htmlFor="email">
                    UCF Email
                  </label>
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

                <div className={styles.field}>
                  <label className={styles.srOnly} htmlFor="password">
                    Password
                  </label>
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
              </>
            )}

            <div className={styles.actions}>
              <button className={styles.btn} type="submit">
                <span>{isSignup ? "Create Account" : "Sign In"}</span>
                {!isSignup && (
                  <img
                    src={keyhole}
                    alt=""
                    className={`${styles.loginIcon} ${
                      animating ? styles.zoomOut : ""
                    }`}
                  />
                )}
              </button>
            </div>

            <p className={styles.meta}>
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={styles.switchBtn}
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={styles.switchBtn}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}