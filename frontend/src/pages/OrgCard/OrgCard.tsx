import {useState} from "react";
import styles from "./OrgCard.module.css";

type OrgCardProps = {
  name: string;
  logo: string;
};

export default function OrgCard({ name, logo }: OrgCardProps) {
  const[isActive, setIsActive] = useState(false);


  return (
    <article 
      className={`${styles.card} ${isActive ? styles.active: ""}`}
      onClick = {() => setIsActive(!isActive)}
      role = "button"
      tabIndex={0}
      onKeyDown={(e) => e.key == "Enter" && setIsActive(!isActive)}
      >
      <div className={styles.thumb}>
        <img src={logo} alt="" aria-hidden="true" />
      </div>
      <h3 className={styles.name}>{name}</h3>
    </article>
  );
}
