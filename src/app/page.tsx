import styles from "./page.module.css";
import Vulnerabilities from "./components/vulnerabilities/Vulnerabilities";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Titt på ting</h1>
          <p>Sårbarhetsprioritering som gir mening.</p>
          <Vulnerabilities />
        </div>
      </main>
    </div>
  );
}
