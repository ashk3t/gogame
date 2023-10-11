import ScaryButton from "../components/buttons/ScaryButton"
import styles from "../styles/base.module.css"

export default function SearchPage() {
  return (
    <main className={`${styles.vcenteringContainer} ${styles.marginEverything}`}>
      <h1>Search...</h1>
      <div className={`${styles.frame} ${styles.vcenteringContainer}`}>
        <h3>3/5</h3>
        <ul className={styles.vcenteringContainer}>
          <li>Shk3t</li>
          <li>ashket</li>
          <li>Phantazumu</li>
        </ul>
      </div>
      <ScaryButton>Cancel</ScaryButton>
    </main>
  )
}