import styles from "./OrgCard.module.css";

type OrgCardProps = {
  name: string;
  logo: string;
};

export default function OrgCard({ name, logo }: OrgCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <img src={logo} alt="" aria-hidden="true" />
      </div>
      <h3 className={styles.name}>{name}</h3>
    </article>
  );
}
