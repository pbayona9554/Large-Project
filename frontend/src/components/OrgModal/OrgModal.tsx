//import { useState } from "react";
import Modal from "../Modal/Modal";
import styles from "./OrgModal.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  description: string;
  onJoin: () => void;
  userOrgs: string[];
};

export default function OrganizationPopup({
  isOpen,
  onClose,
  orgName,
  description,
  onJoin,
  userOrgs, 
}: Props) {
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="org-title">
      <div className={styles.popup}>
        <img src={""} alt="Organization Logo" className={styles.logo} />

        <h2 id="org-title" className={styles.title}>
          {orgName}
        </h2>
        <p className={styles.description}>{description}</p>

        <div className={styles.buttons}>
          <button
            className={styles.joinBtn}
            onClick={onJoin}
          >
            {userOrgs.includes(orgName) ? "Leave" : "Join"}
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}