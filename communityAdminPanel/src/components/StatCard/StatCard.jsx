import styles from './StatCard.module.css';

export default function StatCard({ title, value, helper }) {
  return (
    <article className={styles.card}>
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{helper}</span>
    </article>
  );
}
