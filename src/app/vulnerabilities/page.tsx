import styles from "../page.module.css";
import Vulnerabilities from "../components/vulnerabilities/Vulnerabilities";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Sårbarheter</h1>
          <p>
            Tabellen her er basert på alle applikasjoner som har generert en
            SBOM for Naisconsole, og som er i et namespace du tilhører.
          </p>
          <Vulnerabilities />
        </div>
      </main>
    </div>
  );
}
