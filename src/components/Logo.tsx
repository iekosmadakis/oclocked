import styles from './Logo.module.css'

/** App wordmark with accent O. */
export function Logo() {
  return (
    <span className={styles.logo} aria-label="OClocked">
      <span className={styles.o}>O</span>Clocked
    </span>
  )
}
