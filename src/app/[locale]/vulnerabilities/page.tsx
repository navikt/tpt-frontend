"use client";
import styles from "../page.module.css";
import Vulnerabilities from "../../components/vulnerabilities/Vulnerabilities";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("vulnerabilitiesPage");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p>
            {t("description")}
          </p>
          <Vulnerabilities />
        </div>
      </main>
    </div>
  );
}
