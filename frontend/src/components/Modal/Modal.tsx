import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import closeIcon from "../../assets/close-x.svg";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  labelledBy,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") trapFocus(e);
    }
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      const firstInput = dialogRef.current?.querySelector<HTMLElement>(
        "input, button, a, textarea, select, [tabindex]:not([tabindex='-1'])"
      );
      setTimeout(() => firstInput?.focus(), 0);
      document.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function trapFocus(e: KeyboardEvent) {
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;
    if (e.shiftKey && active === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && active === last) {
      first.focus();
      e.preventDefault();
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.root} aria-hidden={!isOpen}>
      <div className={styles.overlay} onClick={onClose} />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={dialogRef}
      >
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <img src={closeIcon} alt="Close" className={styles.closeIcon} />
        </button>

        {children}
      </div>
    </div>
  );
}
