import styles from './SkeletonCard.module.css'

/** Placeholder card shown while timezone data is loading. */
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.city} />
        <div className={styles.fav} />
      </div>
      <div className={styles.time} />
      <div className={styles.meta} />
      <div className={styles.footer} />
    </div>
  )
}
