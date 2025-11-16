// LoginModal.tsx
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
  
  // Main modes
  const [isSignup, setIsSignup] = useState(false);
  const [isVerify, setIsVerify] = useState(false);
  const [isForgotPwd, setIsForgotPwd] = useState(false);
  const [isResetPwd, setIsResetPwd] = useState(false);

  // Shared
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Login
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  // Signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [role, setRole] = useState<Role>("member");

  // Verification & Reset Code
  const [code, setCode] = useState("");
  const [tempEmail, setTempEmail] = useState(""); // holds email during verification/reset

  // Reset Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Helper: Reset all forms
  const resetAll = () => {
    setEmail(""); setPwd("");
    setFirstName(""); setLastName(""); setSignupEmail(""); setSignupPwd(""); setRole("member");
    setCode(""); setNewPassword(""); setConfirmPassword("");
    setMessage(""); setLoading(false);
    setIsVerify(false); setIsForgotPwd(false); setIsResetPwd(false);
  };

  // === SIGNUP SUBMIT ===
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.endsWith("@ucf.edu")) {
      alert("Please use your @ucf.edu email address");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email: signupEmail,
        password: signupPwd,
        role: role === "officer" ? "admin" : "student",
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setTempEmail(signupEmail);
      setIsVerify(true);
      setMessage("Check your email for the 6-digit code!");
    } catch (err: any) {
      alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // === VERIFY CODE ===
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      alert("Email verified! You can now log in.");
      setIsSignup(false);
      resetAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === RESEND CODE ===
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email: tempEmail || signupEmail,
        password: signupPwd,
      };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to resend");
      setMessage("New code sent!");
    } catch {
      alert("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // === FORGOT PASSWORD - SEND RESET CODE ===
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Enter your email first");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setTempEmail(email);
      setIsForgotPwd(false);
      setIsResetPwd(true);
      setMessage("Check your email for the reset code");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === SUBMIT NEW PASSWORD ===
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords don't match");
    if (newPassword.length < 6) return alert("Password too short");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, code, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert("Password reset successful! You can now log in.");
      resetAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === LOGIN SUBMIT ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setUser(
        {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        },
        data.token
      );

      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} labelledBy="authTitle">
      <div className={styles.card}>
        <div className={styles.inner}>

          {/* ========== VERIFICATION POPUP ========== */}
          {isVerify && (
            <>
              <h1 id="authTitle" className={styles.title}>Verify Email</h1>
              <p style={{ textAlign: "center", marginBottom: "20px" }}>
                We sent a 6-digit code to <strong>{tempEmail}</strong>
              </p>
              <form onSubmit={handleVerify}>
                <div className={styles.field}>
                  <input
                    className={styles.input}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    style={{ letterSpacing: "8px", fontSize: "24px", textAlign: "center" }}
                  />
                </div>

                {message && <p style={{ textAlign: "center", color: "#0a0a0a" }}>{message}</p>}

                <div className={styles.actions}>
                  <button className={styles.btn} type="submit" disabled={loading || code.length !== 6}>
                    Verify
                  </button>
                </div>

                <p className={styles.meta}>
                  Didn't get it?{" "}
                  <button type="button" className={styles.switchBtn} onClick={handleResendCode} disabled={loading}>
                    Resend Code
                  </button>
                  {" | "}
                  <button type="button" className={styles.switchBtn} onClick={() => { setIsVerify(false); resetAll(); }}>
                    Cancel
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ========== FORGOT PASSWORD EMAIL INPUT ========== */}
          {isForgotPwd && (
            <>
              <h1 id="authTitle" className={styles.title}>Reset Password</h1>
              <form onSubmit={handleForgotPassword}>
                <div className={styles.field}>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="Your UCF Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.actions}>
                  <button className={styles.btn} type="submit" disabled={loading}>
                    Send Reset Code
                  </button>
                </div>
                <p className={styles.meta}>
                  <button type="button" className={styles.switchBtn} onClick={() => setIsForgotPwd(false)}>
                    Back to Login
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ========== RESET PASSWORD WITH CODE ========== */}
          {isResetPwd && (
            <>
              <h1 id="authTitle" className={styles.title}>Set New Password</h1>
              <p style={{ textAlign: "center", marginBottom: "20px" }}>
                Enter the code sent to <strong>{tempEmail}</strong>
              </p>
              <form onSubmit={handleResetPassword}>
                <div className={styles.field}>
                  <input
                    className={styles.input}
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.field}>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.actions}>
                  <button className={styles.btn} type="submit" disabled={loading}>
                    Reset Password
                  </button>
                </div>
                <p className={styles.meta}>
                  <button type="button" className={styles.switchBtn} onClick={resetAll}>
                    Cancel
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ========== MAIN LOGIN / SIGNUP ========== */}
          {!isVerify && !isForgotPwd && !isResetPwd && (
            <>
              <h1 id="authTitle" className={styles.title}>
                {isSignup ? "Sign Up" : "Login"}
              </h1>

              <form onSubmit={isSignup ? handleSignup : handleLogin}>
                {/* Signup Fields – First Name & Last Name stacked vertically */}
                {isSignup && (
                  <>
                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="UCF Email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        value={signupPwd}
                        onChange={(e) => setSignupPwd(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <select
                        className={`${styles.input} ${styles.select}`}
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                      >
                        <option value="member">Member (Student)</option>
                        <option value="officer">Officer (Admin)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Login Fields */}
                {!isSignup && (
                  <>
                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="UCF Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className={styles.actions}>
                  <button className={styles.btn} type="submit" disabled={loading}>
                    <span>{isSignup ? "Create Account" : "Sign In"}</span>
                    {!isSignup && (
                      <img src={keyhole} alt="" className={styles.loginIcon} />
                    )}
                  </button>
                </div>

                <p className={styles.meta}>
                  {isSignup ? (
                    <>Already have an account? <button type="button" className={styles.switchBtn} onClick={() => setIsSignup(false)}>Log In</button></>
                  ) : (
                    <>
                      Don’t have an account? <button type="button" className={styles.switchBtn} onClick={() => setIsSignup(true)}>Sign Up</button>
                      {" • "}
                      <button type="button" className={styles.switchBtn} onClick={() => setIsForgotPwd(true)}>
                        Forgot Password?
                      </button>
                    </>
                  )}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}