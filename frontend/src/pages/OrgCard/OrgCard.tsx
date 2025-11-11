import {useState} from "react";
import styles from "./OrgCard.module.css";
import React from "react";

type OrgCardProps = {
  name: string;
  logo: string;
  onClick?: () => void;
};

export default function OrgCard({ name, logo, onClick }: OrgCardProps) {
  return (
    <article
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className={styles.thumb}>
        <img src={logo} alt={`${name} logo`} />
      </div>
      <h3 className={styles.name}>{name}</h3>
    </article>
  );
}
