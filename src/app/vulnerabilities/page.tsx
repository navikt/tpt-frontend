import styles from "../page.module.css";
import Vulnerabilities from "../components/vulnerabilities/Vulnerabilities";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Sårbarheter</h1>
          <p>
            Tabellen er basert på alle applikasjoner som har generert en SBOM
            for nais console, og som er i et namespace du tilhører.
          </p>
          <Vulnerabilities />
        </div>
      </main>
    </div>
  );
}
